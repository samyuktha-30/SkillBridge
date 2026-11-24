using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SkillBridge.Application.Common.Interfaces;
using SkillBridge.Application.DTOs;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.Infrastructure.Integrations;

public class AiServiceClient : IAiServiceClient
{
    private readonly HttpClient _http;
    private readonly ILogger<AiServiceClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public AiServiceClient(HttpClient http, ILogger<AiServiceClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<AiClusterAnalysisResponseDto> AnalyzeSkillClustersAsync(
        AiClusterAnalysisRequestDto request, CancellationToken ct = default)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("/ai/v1/analysis/skill-clusters", request, JsonOptions, ct);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("AI cluster endpoint returned {StatusCode}: {Body}", response.StatusCode, err);
                throw new DomainException($"AI Service error ({(int)response.StatusCode}): Unable to run skill cluster analysis.");
            }

            return await response.Content.ReadFromJsonAsync<AiClusterAnalysisResponseDto>(JsonOptions, ct)
                ?? throw new DomainException("AI Service returned an empty skill cluster response.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Unable to reach Python FastAPI AI service for skill clustering.");
            throw new DomainException("Python FastAPI AI service is unreachable. Start ai-service on port 8000 and retry.");
        }
    }

    public async Task<AiGeneratePlanResponseDto> GenerateLearningPlanAsync(
        AiGeneratePlanRequestDto request, CancellationToken ct = default)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("/ai/v1/learning-plans/generate", request, JsonOptions, ct);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("AI learning plan endpoint returned {StatusCode}: {Body}", response.StatusCode, err);
                throw new DomainException($"AI Service error ({(int)response.StatusCode}): Unable to generate learning plan.");
            }

            return await response.Content.ReadFromJsonAsync<AiGeneratePlanResponseDto>(JsonOptions, ct)
                ?? throw new DomainException("AI Service returned an empty learning plan response.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Unable to reach Python FastAPI AI service for learning plan generation.");
            throw new DomainException("Python FastAPI AI service is unreachable. Start ai-service on port 8000 and retry.");
        }
    }

    public async Task<AiChatReplyDto> ChatAsync(AiChatRequestDto request, CancellationToken ct = default)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("/ai/v1/assistant/chat", request, JsonOptions, ct);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("AI assistant chat endpoint returned {StatusCode}: {Body}", response.StatusCode, err);
                throw new DomainException($"AI Service error ({(int)response.StatusCode}): AI Assistant could not reply.");
            }

            return await response.Content.ReadFromJsonAsync<AiChatReplyDto>(JsonOptions, ct)
                ?? throw new DomainException("AI Service returned an empty assistant reply.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Unable to reach Python FastAPI AI service for AI Assistant chat.");
            throw new DomainException("Python FastAPI AI service is unreachable. Start ai-service on port 8000 and retry.");
        }
    }

    public async Task<AiResourceRecommendationResponseDto> RecommendResourcesAsync(
        AiResourceRecommendationRequestDto request, CancellationToken ct = default)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("/ai/v1/recommendations/resources", request, JsonOptions, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI resource recommendations returned {StatusCode}", response.StatusCode);
                return new AiResourceRecommendationResponseDto(new List<AiRankedResourceDto>());
            }

            return await response.Content.ReadFromJsonAsync<AiResourceRecommendationResponseDto>(JsonOptions, ct)
                ?? new AiResourceRecommendationResponseDto(new List<AiRankedResourceDto>());
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Python FastAPI AI service unavailable for optional resource ranking.");
            return new AiResourceRecommendationResponseDto(new List<AiRankedResourceDto>());
        }
    }
}
