using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail, errors) = exception switch
        {
            ValidationDomainException valEx => (
                StatusCodes.Status400BadRequest,
                "Validation Failed",
                valEx.Message,
                valEx.Errors),
            UnauthorizedDomainException unauthEx => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                unauthEx.Message,
                null),
            ForbiddenDomainException forbEx => (
                StatusCodes.Status403Forbidden,
                "Forbidden",
                forbEx.Message,
                null),
            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                "Resource Not Found",
                notFoundEx.Message,
                null),
            DomainException domEx => (
                StatusCodes.Status400BadRequest,
                "Domain Rule Error",
                domEx.Message,
                null),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred while processing your request.",
                null)
        };

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning("Handled {StatusCode} on {Method} {Path}: {Detail}", statusCode, context.Request.Method, context.Request.Path, detail);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        if (errors != null)
        {
            problem.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
