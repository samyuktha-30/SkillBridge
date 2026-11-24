from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class EmployeeSkillVector(BaseModel):
    employeeId: str
    employeeName: str
    gapScores: Dict[str, float]


class ClusterAnalysisRequest(BaseModel):
    skillNames: List[str]
    employees: List[EmployeeSkillVector]


class ClusterResult(BaseModel):
    clusterLabel: str
    employeeCount: int
    focusSkills: List[str]


class ClusterAnalysisResponse(BaseModel):
    methodology: str
    sampleCount: int
    clusters: List[ClusterResult]


class SkillGapInput(BaseModel):
    skillName: str
    currentLevel: int
    requiredLevel: int
    gapLevel: int


class GeneratePlanRequest(BaseModel):
    employeeName: str
    targetRoleTitle: str
    skillGaps: List[SkillGapInput]
    availableSkills: List[str]


class GeneratedModule(BaseModel):
    title: str
    description: str
    skillName: str
    estimatedHours: float = Field(ge=0.5, le=40.0)


class GeneratePlanResponse(BaseModel):
    planTitle: str
    estimatedWeeks: int = Field(ge=1, le=24)
    goalLabel: str
    modules: List[GeneratedModule]


class ChatTurn(BaseModel):
    sender: str
    content: str


class ChatRequest(BaseModel):
    mode: str
    userMessage: str
    employeeName: str
    targetRoleTitle: str
    skillGaps: List[SkillGapInput]
    history: List[ChatTurn] = Field(default_factory=list)


class ChatReply(BaseModel):
    reply: str
    codeSnippet: Optional[str] = None


class ResourceCatalogItem(BaseModel):
    id: str
    title: str
    skillName: str
    resourceType: str
    difficulty: str


class ResourceRecommendationRequest(BaseModel):
    targetRoleTitle: str
    skillGaps: List[SkillGapInput]
    catalog: List[ResourceCatalogItem]


class RankedResource(BaseModel):
    id: str
    reason: str


class ResourceRecommendationResponse(BaseModel):
    recommendations: List[RankedResource]
