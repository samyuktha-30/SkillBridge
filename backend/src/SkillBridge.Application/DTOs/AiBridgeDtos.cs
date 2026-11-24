namespace SkillBridge.Application.DTOs;

public record AiEmployeeSkillVectorDto(string EmployeeId, string EmployeeName, Dictionary<string, double> GapScores);
public record AiClusterAnalysisRequestDto(List<string> SkillNames, List<AiEmployeeSkillVectorDto> Employees);
public record AiClusterResultDto(string ClusterLabel, int EmployeeCount, List<string> FocusSkills);
public record AiClusterAnalysisResponseDto(string Methodology, int SampleCount, List<AiClusterResultDto> Clusters);

public record AiSkillGapInputDto(string SkillName, int CurrentLevel, int RequiredLevel, int GapLevel);
public record AiGeneratePlanRequestDto(string EmployeeName, string TargetRoleTitle, List<AiSkillGapInputDto> SkillGaps, List<string> AvailableSkills);
public record AiGeneratedModuleDto(string Title, string Description, string SkillName, decimal EstimatedHours);
public record AiGeneratePlanResponseDto(string PlanTitle, int EstimatedWeeks, string GoalLabel, List<AiGeneratedModuleDto> Modules);

public record AiChatTurnDto(string Sender, string Content);
public record AiChatRequestDto(
    string Mode,
    string UserMessage,
    string EmployeeName,
    string TargetRoleTitle,
    List<AiSkillGapInputDto> SkillGaps,
    List<AiChatTurnDto> History);

public record AiChatReplyDto(string Reply, string? CodeSnippet);

public record AiResourceCatalogItemDto(Guid Id, string Title, string SkillName, string ResourceType, string Difficulty);
public record AiResourceRecommendationRequestDto(string TargetRoleTitle, List<AiSkillGapInputDto> SkillGaps, List<AiResourceCatalogItemDto> Catalog);
public record AiRankedResourceDto(Guid Id, string Reason);
public record AiResourceRecommendationResponseDto(List<AiRankedResourceDto> Recommendations);
