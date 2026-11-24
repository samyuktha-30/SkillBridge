using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using SkillBridge.Domain.Exceptions;

namespace SkillBridge.API.Filters;

public class FluentValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public FluentValidationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            if (_serviceProvider.GetService(validatorType) is IValidator validator)
            {
                var validationContext = new ValidationContext<object>(arg);
                var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);
                if (!result.IsValid)
                {
                    var errors = result.Errors
                        .GroupBy(e => string.IsNullOrEmpty(e.PropertyName) ? "request" : char.ToLowerInvariant(e.PropertyName[0]) + e.PropertyName[1..])
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

                    throw new ValidationDomainException(errors);
                }
            }
        }

        await next();
    }
}
