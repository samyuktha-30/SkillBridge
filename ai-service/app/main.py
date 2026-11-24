from fastapi import Depends, FastAPI, Header, HTTPException, status

from app.core.config import settings
from app.schemas.contracts import (
    ChatReply,
    ChatRequest,
    ClusterAnalysisRequest,
    ClusterAnalysisResponse,
    GeneratePlanRequest,
    GeneratePlanResponse,
    ResourceRecommendationRequest,
    ResourceRecommendationResponse,
)
from app.services.gemini_client import assistant_chat, generate_learning_plan, recommend_resources
from app.services.skill_clustering import run_skill_cluster_analysis

app = FastAPI(
    title="SkillBridge AI Intelligence Service",
    version="1.0.0",
    description="Python FastAPI service running Scikit-learn skill clustering and Google Gemini recommendations for SkillBridge AI.",
)


def verify_internal_key(x_internal_service_key: str = Header(default="")) -> None:
    if x_internal_service_key != settings.internal_service_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Internal-Service-Key header.",
        )


@app.get("/ai/v1/health")
def health() -> dict:
    return {
        "status": "Healthy",
        "service": "SkillBridge.AI",
        "geminiModel": settings.gemini_model,
        "minClusterSamples": settings.min_cluster_samples,
    }


@app.post(
    "/ai/v1/analysis/skill-clusters",
    response_model=ClusterAnalysisResponse,
    dependencies=[Depends(verify_internal_key)],
)
def analyze_skill_clusters(request: ClusterAnalysisRequest) -> ClusterAnalysisResponse:
    return run_skill_cluster_analysis(request)


@app.post(
    "/ai/v1/learning-plans/generate",
    response_model=GeneratePlanResponse,
    dependencies=[Depends(verify_internal_key)],
)
def create_learning_plan(request: GeneratePlanRequest) -> GeneratePlanResponse:
    try:
        return generate_learning_plan(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post(
    "/ai/v1/assistant/chat",
    response_model=ChatReply,
    dependencies=[Depends(verify_internal_key)],
)
def chat_with_assistant(request: ChatRequest) -> ChatReply:
    try:
        return assistant_chat(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@app.post(
    "/ai/v1/recommendations/resources",
    response_model=ResourceRecommendationResponse,
    dependencies=[Depends(verify_internal_key)],
)
def get_resource_recommendations(
    request: ResourceRecommendationRequest,
) -> ResourceRecommendationResponse:
    try:
        return recommend_resources(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
