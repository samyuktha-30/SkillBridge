using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Domain.Entities;

namespace SkillBridge.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string AccessToken, DateTime ExpiresAtUtc) GenerateAccessToken(UserProfile profile)
    {
        var secret = _config["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey is not configured.");
        var issuer = _config["Jwt:Issuer"] ?? "SkillBridge.API";
        var audience = _config["Jwt:Audience"] ?? "SkillBridge.Frontend";
        var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : 30;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(minutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, profile.IdentityUserId.ToString()),
            new(JwtRegisteredClaimNames.Email, profile.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("profile_id", profile.Id.ToString()),
            new(ClaimTypes.NameIdentifier, profile.IdentityUserId.ToString()),
            new(ClaimTypes.Email, profile.Email),
            new(ClaimTypes.Role, profile.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateOpaqueRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public string HashToken(string rawToken)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
