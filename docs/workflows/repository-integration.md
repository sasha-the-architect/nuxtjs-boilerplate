
# Integrasi Agen dengan Repositori

## Overview

Semua 13 agen AI terintegrasi secara penuh dengan repositori GitHub melalui berbagai mekanisme yang memungkinkan komunikasi, koordinasi, dan sinkronisasi pekerjaan. Dokumen ini menjelaskan secara detail bagaimana integrasi ini bekerja.

## Mekanisme Integrasi

### 1. GitHub Actions Workflow

Setiap agen diimplementasikan sebagai GitHub Actions workflow yang berjalan secara otomatis sesuai jadwal yang ditentukan:

```yaml
# Contoh struktur workflow
name: ai - [nama-agent]

on:
  schedule:
    - cron: '[jadwal-eksekusi]'  # Jadwal spesifik untuk setiap agen
  workflow_dispatch:  # Memungkinkan eksekusi manual

permissions:
  id-token: write
  contents: write
  pull-requests: write
  issues: write
  actions: write

jobs:
  opencode:
    runs-on: ubuntu-24.04-arm
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      # ... langkah-langkah eksekusi agen
```

### 2. OpenCode CLI Integration

Setiap agen menggunakan OpenCode CLI untuk menjalankan AI model dengan prompt spesifik:

```bash
opencode run "$(cat <<'PROMPT'
  [Prompt detail untuk agen]
PROMPT
)" \
  --model [model-ai-sesuai] \
  --share false
```

### 3. Git Operations

Semua agen memiliki kemampuan untuk melakukan operasi Git langsung ke repositori:

```bash
# Konfigurasi git untuk setiap agen
git config user.name "ai-[nama-agent]"
git config user.email "ai-[nama-agent]@startup.ai"

# Commit perubahan
git commit -m "[nama-agent]: [deskripsi singkat]"

# Push ke remote
git push origin main
```

## Alur Komunikasi melalui Repositori

### 1. Issue-based Communication

Agen berkomunikasi melalui GitHub Issues dengan sistem label yang terstruktur:

#### Label Standar:
- `ceo-directive`: Arahan strategis dari CEO Agent
- `integration-task`: Tugas yang didistribusikan oleh Integration Agent
- `financial-directive`: Arahan keuangan dari CFO Agent
- `marketing-initiative`: Inisiatif dari CMO Agent
- `operational-improvement`: Perbaikan dari COO Agent
- `research-development`: Aktivitas R&D
- `data-analysis`: Tugas analisis data
- `security`: Isu keamanan
- `customer-success`: Aktivitas customer success
- `hr-management`: Tugas manajemen HR
- `legal-compliance`: Isu legal dan compliance

#### Contoh Alur Komunikasi:
1. CEO Agent membuat issue dengan label `ceo-directive`
2. Integration Agent membaca issue dan membuat sub-tasks untuk agen lain
3. Agen terkait mengerjakan tugas dan update issue
4. Integration Agent mengumpulkan hasil dan melaporkan kembali

### 2. Pull Request Collaboration

Untuk perubahan signifikan, agen menggunakan Pull Request:

```yaml
# Langkah-langkah dalam workflow
- name: Create Pull Request
  if: contains(steps.run_agent.outputs.stdout, 'significant-change')
  run: |
    gh pr create --title "[nama-agent]: [judul]" --body "[deskripsi]"
```

### 3. File-based Communication

Agen juga berkomunikasi melalui file di repositori:

#### Struktur Folder Komunikasi:
```
/
├── .github/
│   └── workflows/          # Workflow definitions
├── docs/
│   ├── reports/           # Laporan harian dari agen
│   ├── coordination/      # File koordinasi antar agen
│   └── shared/           # Data bersama antar agen
├── data/
│   ├── inputs/           # Input data untuk agen
│   └── outputs/          # Output dari agen
└── config/
    └── agents/           # Konfigurasi spesifik agen
```

## Sinkronisasi Data

### 1. Shared Data Repository

Agen mengakses data bersama melalui folder `data/`:

```bash
# Contoh akses data dalam workflow
- name: Access Shared Data
  run: |
    # Baca data dari agen lain
    cat data/outputs/cto/tech-roadmap.md
    
    # Tulis output untuk agen lain
    echo "Analysis results" > data/outputs/data-analyst/daily-insights.md
```

### 2. State Management

Setiap agen mempertahankan state melalui file konfigurasi:

```yaml
# Contoh state file
last_run: 2024-01-01T08:00:00Z
current_tasks:
  - id: task-001
    status: in-progress
    assigned_to: cto-agent
