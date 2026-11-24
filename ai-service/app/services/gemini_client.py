import json
from typing import List
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.contracts import (
    ChatReply,
    ChatRequest,
    GeneratePlanRequest,
    GeneratePlanResponse,
    RankedResource,
    ResourceRecommendationRequest,
    ResourceRecommendationResponse,
)


def _get_client() -> genai.Client:
    if not settings.gemini_api_key or settings.gemini_api_key == "YOUR_GEMINI_API_KEY":
        raise RuntimeError("GEMINI_API_KEY is not configured in ai-service/.env.")
    return genai.Client(api_key=settings.gemini_api_key)


def generate_learning_plan(request: GeneratePlanRequest) -> GeneratePlanResponse:
    client = _get_client()

    gaps_text = "\n".join(
        f"- {g.skillName}: current {g.currentLevel}/5, target {g.requiredLevel}/5 (gap {g.gapLevel})"
        for g in request.skillGaps
    ) or "- Baseline assessment pending; build foundational modules for the target role."

    prompt = f"""
You are a senior engineering learning architect for SkillBridge AI.
Design a focused, realistic, personalized learning plan for employee "{request.employeeName}" targeting the role "{request.targetRoleTitle}".

Current Skill Gaps:
{gaps_text}

Allowed Skill Names (every module's skillName MUST match one of these exact strings):
{", ".join(request.availableSkills)}

Requirements:
1. Return 4 to 5 sequential modules ordered from highest skill gap to lowest.
2. Each module must have a clear actionable title, concise practical description, exact skillName from the allowed list, and realistic estimatedHours (between 1.5 and 8.0).
3. Do not invent fake percentages or claim guaranteed job outcomes.
""".strip()

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeneratePlanResponse,
            temperature=0.3,
        ),
    )

    payload = json.loads(response.text)
    return GeneratePlanResponse.model_validate(payload)


def assistant_chat(request: ChatRequest) -> ChatReply:
    client = _get_client()

    mode_guidance = {
        "Ask a Question": "Answer concisely and clearly with practical engineering examples.",
        "Coding Help": "Provide production-ready code guidance and optionally populate codeSnippet with clean runnable code.",
        "Explain Concept": "Break the concept down step-by-step from intuition to real-world usage.",
        "My Mistakes": "Analyze common pitfalls and assessment mistakes related to the employee's highest gaps and explain how to fix them.",
        "Practice Exercise": "Give a concrete hands-on mini-exercise with acceptance criteria and optional starter snippet in codeSnippet.",
    }.get(request.mode, "Provide clear, accurate technical coaching.")

    gaps_summary = ", ".join(
        f"{g.skillName} (current {g.currentLevel}/{g.requiredLevel})"
        for g in request.skillGaps
        if g.gapLevel > 0
    ) or "No major gaps detected"

    history_text = "\n".join(f"{t.sender}: {t.content}" for t in request.history[-6:])

    prompt = f"""
You are the SkillBridge AI Learning Assistant.
Mode: {request.mode}
Mode Instruction: {mode_guidance}
Employee: {request.employeeName}
Target Role: {request.targetRoleTitle}
Active Skill Gaps: {gaps_summary}

Recent Conversation:
{history_text}

User Message:
{request.userMessage}

Respond in JSON matching the ChatReply schema. Put clean code ONLY in `codeSnippet` when relevant, or null otherwise.
""".strip()

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ChatReply,
            temperature=0.4,
        ),
    )

    payload = json.loads(response.text)
    return ChatReply.model_validate(payload)


def recommend_resources(request: ResourceRecommendationRequest) -> ResourceRecommendationResponse:
    gap_map = {g.skillName.lower(): g.gapLevel for g in request.skillGaps if g.gapLevel > 0}

    # If GEMINI_API_KEY is configured, rank with Gemini; otherwise rank deterministically by gap alignment
    if not settings.gemini_api_key or settings.gemini_api_key == "YOUR_GEMINI_API_KEY":
        ranked: List[RankedResource] = []
        for item in request.catalog:
            gap_val = gap_map.get(item.skillName.lower(), 0)
            if gap_val > 0:
                ranked.append(
                    RankedResource(
                        id=item.id,
                        reason=f"Targets your {gap_val}-level gap in {item.skillName} for {request.targetRoleTitle}.",
                    )
                )
        return ResourceRecommendationResponse(recommendations=ranked[:6])

    client = _get_client()
    catalog_summary = "\n".join(
        f"- id={c.id} | title={c.title} | skill={c.skillName} | type={c.resourceType} | difficulty={c.difficulty}"
        for c in request.catalog[:25]
    )
    gaps_summary = "\n".join(
        f"- {g.skillName}: gap {g.gapLevel} (current {g.currentLevel}/5 vs target {g.requiredLevel}/5)"
        for g in request.skillGaps
        if g.gapLevel > 0
    )

    prompt = f"""
Rank up to 5 resources from the catalog that best help close the employee's skill gaps for "{request.targetRoleTitle}".
Only return IDs that appear verbatim in the catalog below, with a 1-sentence reason referencing the matching skill gap.

Skill Gaps:
{gaps_summary}

Catalog:
{catalog_summary}
""".strip()

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResourceRecommendationResponse,
            temperature=0.2,
        ),
    )

    payload = json.loads(response.text)
    return ResourceRecommendationResponse.model_validate(payload)
