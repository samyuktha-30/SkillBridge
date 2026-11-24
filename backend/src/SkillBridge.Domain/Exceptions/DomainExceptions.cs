namespace SkillBridge.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"{name} ({key}) was not found.") { }
}

public class UnauthorizedDomainException : Exception
{
    public UnauthorizedDomainException(string message) : base(message) { }
}

public class ForbiddenDomainException : Exception
{
    public ForbiddenDomainException(string message) : base(message) { }
}

public class ValidationDomainException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationDomainException(IDictionary<string, string[]> errors)
        : base("One or more validation failures occurred.")
    {
        Errors = errors;
    }

    public ValidationDomainException(string field, string message)
        : this(new Dictionary<string, string[]> { [field] = new[] { message } }) { }
}
