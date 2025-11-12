# Receiptify Kubernetes Manifests

이 디렉토리는 Receiptify 애플리케이션을 Kubernetes에 배포하기 위한 매니페스트 파일들을 포함합니다.

## 디렉토리 구조

```
manifests/
├── backend/                    # 백엔드 매니페스트
│   ├── deployment.yaml        # 백엔드 Deployment
│   ├── service.yaml           # 백엔드 Service
│   ├── pvc.yaml              # SQLite 데이터 저장용 PVC
│   ├── secret.yaml           # JWT Secret 등
│   └── kustomization.yaml    # 백엔드 Kustomize 설정
├── frontend/                  # 프론트엔드 매니페스트
│   ├── deployment.yaml       # 프론트엔드 Deployment
│   ├── service.yaml          # 프론트엔드 Service
│   ├── ingress.yaml          # Ingress (외부 접근)
│   └── kustomization.yaml    # 프론트엔드 Kustomize 설정
├── namespace.yaml            # Namespace 정의
├── kustomization.yaml        # 루트 Kustomize 설정
└── argocd-application.yaml   # ArgoCD Application 정의

```

## 사전 요구사항

- Kubernetes 클러스터 (v1.20+)
- kubectl 설치
- ArgoCD 설치
- Ingress Controller (nginx-ingress 권장)
- cert-manager (HTTPS 인증서용, 선택사항)

## 설정 변경 필요 항목

### 1. GitHub Container Registry 접근

각 `kustomization.yaml`에서 이미지 경로 수정:
```yaml
images:
- name: ghcr.io/YOUR_USERNAME/receiptify/backend
  newTag: latest
```

### 2. 도메인 설정

`frontend/ingress.yaml`에서 도메인 변경:
```yaml
spec:
  tls:
  - hosts:
    - your-domain.com  # 변경
  rules:
  - host: your-domain.com  # 변경
```

### 3. Secret 설정

`backend/secret.yaml`에서 JWT Secret 변경:
```bash
# Base64로 인코딩된 값으로 변경하거나
kubectl create secret generic receiptify-backend-secret \
  --from-literal=jwt-secret='your-strong-secret-key' \
  -n receiptify
```

### 4. ArgoCD Application

`argocd-application.yaml`에서 리포지토리 URL 변경:
```yaml
source:
  repoURL: https://github.com/YOUR_USERNAME/receiptify.git
```

## 배포 방법

### 방법 1: kubectl + kustomize

```bash
# 전체 배포
kubectl apply -k manifests/

# 백엔드만 배포
kubectl apply -k manifests/backend/

# 프론트엔드만 배포
kubectl apply -k manifests/frontend/

# 확인
kubectl get all -n receiptify
```

### 방법 2: ArgoCD (권장)

```bash
# ArgoCD Application 생성
kubectl apply -f manifests/argocd-application.yaml

# ArgoCD UI에서 확인
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 브라우저에서 https://localhost:8080 접속
```

## 리소스 구성

### Backend
- **Deployment**: 2 replicas
- **Service**: ClusterIP (내부 통신용)
- **PVC**: 1Gi (SQLite 데이터 저장)
- **Resources**:
  - Requests: 128Mi / 100m CPU
  - Limits: 512Mi / 500m CPU

### Frontend
- **Deployment**: 2 replicas
- **Service**: ClusterIP
- **Ingress**: Nginx Ingress Controller
- **Resources**:
  - Requests: 64Mi / 50m CPU
  - Limits: 256Mi / 200m CPU

## Health Check

백엔드와 프론트엔드 모두 Liveness/Readiness Probe 설정되어 있습니다:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 30
```

## ArgoCD Sync Policy

자동 동기화가 활성화되어 있습니다:
- **Prune**: 삭제된 리소스 자동 제거
- **SelfHeal**: 수동 변경 시 자동 복구
- **Retry**: 실패 시 자동 재시도 (최대 5회)

## 모니터링

```bash
# Pod 상태 확인
kubectl get pods -n receiptify

# 로그 확인
kubectl logs -f deployment/receiptify-backend -n receiptify
kubectl logs -f deployment/receiptify-frontend -n receiptify

# 서비스 확인
kubectl get svc -n receiptify

# Ingress 확인
kubectl get ingress -n receiptify
```

## 트러블슈팅

### 1. ImagePullBackOff 에러

GitHub Container Registry 인증 필요:
```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n receiptify

# deployment.yaml에 추가
spec:
  template:
    spec:
      imagePullSecrets:
      - name: ghcr-secret
```

### 2. PVC Pending 상태

StorageClass 확인 및 수정:
```bash
kubectl get storageclass
# backend/pvc.yaml에서 storageClassName 수정
```

### 3. Ingress 접근 불가

```bash
# Ingress Controller 설치 확인
kubectl get pods -n ingress-nginx

# DNS 설정 확인
nslookup your-domain.com
```

## 업데이트

GitHub Actions에서 새 이미지가 빌드되면:
1. ArgoCD가 자동으로 감지
2. 새 이미지로 자동 배포 (syncPolicy.automated)
3. 롤링 업데이트 수행

수동 업데이트:
```bash
# 이미지 태그 변경
kubectl set image deployment/receiptify-backend \
  backend=ghcr.io/YOUR_USERNAME/receiptify/backend:20250112-143000 \
  -n receiptify
```

## 참고 자료

- [Kustomize 공식 문서](https://kustomize.io/)
- [ArgoCD 공식 문서](https://argo-cd.readthedocs.io/)
- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
