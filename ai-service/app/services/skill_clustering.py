from typing import List
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from app.core.config import settings
from app.schemas.contracts import (
    ClusterAnalysisRequest,
    ClusterAnalysisResponse,
    ClusterResult,
)


def run_skill_cluster_analysis(request: ClusterAnalysisRequest) -> ClusterAnalysisResponse:
    """
    Applies Scikit-learn StandardScaler + KMeans when assessed employee sample count
    meets the configured statistical minimum (MIN_CLUSTER_SAMPLES, default 15).
    Otherwise falls back transparently to ExplainableRuleBased grouping without
    fabricating synthetic training data or claiming unverified accuracy metrics.
    """
    sample_count = len(request.employees)
    skill_names = request.skillNames

    if sample_count == 0 or len(skill_names) == 0:
        return ClusterAnalysisResponse(
            methodology="ExplainableRuleBased (Awaiting assessed employee vectors)",
            sampleCount=0,
            clusters=[
                ClusterResult(
                    clusterLabel="Baseline Assessment Pending",
                    employeeCount=0,
                    focusSkills=skill_names[:3],
                )
            ],
        )

    matrix = np.array(
        [[float(emp.gapScores.get(skill, 0.0)) for skill in skill_names] for emp in request.employees],
        dtype=float,
    )

    if sample_count < settings.min_cluster_samples:
        on_target = []
        moderate = []
        high_priority = []

        for idx, emp in enumerate(request.employees):
            total_gap = float(np.sum(matrix[idx]))
            if total_gap <= 0:
                on_target.append(emp)
            elif total_gap <= 3:
                moderate.append((emp, matrix[idx]))
            else:
                high_priority.append((emp, matrix[idx]))

        clusters: List[ClusterResult] = []
        if high_priority:
            avg_vec = np.mean([row for _, row in high_priority], axis=0)
            top_indices = np.argsort(avg_vec)[::-1][:3]
            clusters.append(
                ClusterResult(
                    clusterLabel="Priority Upskilling Cohort (Gap Sum >= 4)",
                    employeeCount=len(high_priority),
                    focusSkills=[skill_names[i] for i in top_indices if avg_vec[i] > 0] or skill_names[:2],
                )
            )
        if moderate:
            avg_vec = np.mean([row for _, row in moderate], axis=0)
            top_indices = np.argsort(avg_vec)[::-1][:3]
            clusters.append(
                ClusterResult(
                    clusterLabel="Targeted Refinement Cohort (Gap Sum 1-3)",
                    employeeCount=len(moderate),
                    focusSkills=[skill_names[i] for i in top_indices if avg_vec[i] > 0] or skill_names[:2],
                )
            )
        if on_target:
            clusters.append(
                ClusterResult(
                    clusterLabel="Role-Ready Cohort (Zero Gaps)",
                    employeeCount=len(on_target),
                    focusSkills=[],
                )
            )

        return ClusterAnalysisResponse(
            methodology=f"ExplainableRuleBased (Sample size {sample_count} < {settings.min_cluster_samples} minimum for KMeans)",
            sampleCount=sample_count,
            clusters=clusters,
        )

    # Sufficient real samples: run Scikit-learn StandardScaler + KMeans
    scaler = StandardScaler()
    scaled = scaler.fit_transform(matrix)
    n_clusters = min(3, sample_count)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(scaled)

    clusters: List[ClusterResult] = []
    for cluster_id in range(n_clusters):
        member_indices = np.where(labels == cluster_id)[0]
        if len(member_indices) == 0:
            continue
        centroid_gaps = np.mean(matrix[member_indices], axis=0)
        mean_total_gap = float(np.sum(centroid_gaps))
        top_indices = np.argsort(centroid_gaps)[::-1][:3]
        focus = [skill_names[i] for i in top_indices if centroid_gaps[i] > 0.1]

        if mean_total_gap <= 0.5:
            label = f"Cluster {cluster_id + 1}: Role-Ready Specialists"
        elif mean_total_gap <= 4.0:
            label = f"Cluster {cluster_id + 1}: Targeted Upskilling Group"
        else:
            label = f"Cluster {cluster_id + 1}: High-Priority Coaching Cohort"

        clusters.append(
            ClusterResult(
                clusterLabel=label,
                employeeCount=int(len(member_indices)),
                focusSkills=focus,
            )
        )

    return ClusterAnalysisResponse(
        methodology=f"Scikit-learn KMeans (k={n_clusters}, StandardScaler, n={sample_count})",
        sampleCount=sample_count,
        clusters=clusters,
    )
