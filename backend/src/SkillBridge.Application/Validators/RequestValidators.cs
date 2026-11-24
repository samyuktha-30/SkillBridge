using FluentValidation;
using SkillBridge.Application.DTOs;

namespace SkillBridge.Application.Validators;

public class EmployeeRegisterValidator : AbstractValidator<EmployeeRegisterRequestDto>
{
    public EmployeeRegisterValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");
    }
}

public class ManagerRegisterValidator : AbstractValidator<ManagerRegisterRequestDto>
{
    public ManagerRegisterValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateCandidateValidator : AbstractValidator<CreateCandidateDto>
{
    public CreateCandidateValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.JobRoleId).NotEmpty();
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Stage).NotEmpty();
    }
}

public class AssignLearningPlanValidator : AbstractValidator<AssignLearningPlanDto>
{
    public AssignLearningPlanValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.LearningPlanId).NotEmpty();
    }
}

public class SendChatMessageValidator : AbstractValidator<SendChatMessageRequestDto>
{
    public SendChatMessageValidator()
    {
        RuleFor(x => x.Mode).NotEmpty().Must(m => new[]
        {
            "Ask a Question", "Coding Help", "Explain Concept", "My Mistakes", "Practice Exercise"
        }.Contains(m)).WithMessage("Invalid AI Assistant mode.");
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
    }
}

public class GenerateReportValidator : AbstractValidator<GenerateReportRequestDto>
{
    public GenerateReportValidator()
    {
        RuleFor(x => x.ReportType).NotEmpty();
        RuleFor(x => x.Format).Must(f => f == "PDF" || f == "CSV").WithMessage("Format must be PDF or CSV.");
    }
}
