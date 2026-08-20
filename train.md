BRO, WE ARE NOW STARTING THE ACTUAL YOLOv8n TRAINING.

You already know the complete AyurVerify project, dataset structure, annotation pipeline, validation reports, and existing training scripts. DO NOT recreate or modify the dataset preparation pipeline.

Before doing anything, inspect the existing project files and especially:
- dataset/YOLOV8N_FINAL_STATUS.md
- docs/MPBD18_3CLASS_FINAL_STATUS.md
- dataset/PIPELINE_BENCHMARK.md
- dataset/MPBD18_PIPELINE_BENCHMARK.md
- docs/ML_SETUP.md
- dataset/yolo/data.yaml
- dataset/yolo_mpbd18/data.yaml
- scratch/train_yolo.py
- scratch/train_yolo_mpbd18.py

IMPORTANT:
We are currently on the HP i3 CPU machine, NOT the NVIDIA RTX 2050 machine.

Our goal is to start REAL TRAINING now on CPU because we have limited time.

DO NOT:
- modify raw datasets
- modify annotations
- regenerate annotations
- change train/val/test splits
- delete existing files
- overwrite existing smoke-test runs
- change the YOLO architecture
- install unnecessary packages
- start GPU/CUDA installation
- retrain the dataset preparation pipeline

--------------------------------------------------
PHASE 1 — ENVIRONMENT CHECK
--------------------------------------------------

First verify:

1. Python environment
2. PyTorch
3. Ultralytics
4. OpenCV
5. CUDA availability
6. CPU information
7. RAM
8. available disk space

Confirm that the current machine is suitable for CPU training.

If a required dependency is missing, install it into the project's existing virtual environment only.

Do NOT install anything globally.

--------------------------------------------------
PHASE 2 — DATASET VALIDATION
--------------------------------------------------

Before training, automatically run the existing validation scripts.

For the 2-class dataset verify:

Aloevera
Amla

Dataset:
dataset/yolo/data.yaml

Confirm:
- images exist
- labels exist
- train/val/test exist
- no invalid labels
- no orphan labels
- coordinates are normalized
- class IDs are correct
- no cross-split leakage
- data.yaml is valid

Expected current status from the previous report:

Train: 198
Val: 96
Test: 40
Total: 334 annotated images
Unresolved: 0
Invalid labels: 0
Leakage: 0

For the 3-class MPBD-18 dataset verify:

Ashwagandha
Tulshi
Bel

Dataset:
dataset/yolo_mpbd18/data.yaml

Expected current status:

Train: 420
Val: 120
Test: 60
Total: 600 annotated images
Unresolved: 0
Invalid labels: 0
Leakage: 0

If validation fails, STOP and report the exact problem instead of silently changing the dataset.

--------------------------------------------------
PHASE 3 — TRAINING STRATEGY
--------------------------------------------------

We have TWO separately prepared datasets.

Do NOT automatically merge them.

Run training separately:

MODEL A:
Aloevera + Amla

MODEL B:
Ashwagandha + Tulshi + Bel

Use the existing YOLOv8n pretrained model:

yolov8n.pt

We want REAL TRAINING, NOT a smoke test.

Because this machine is an Intel i3 CPU, start with a practical CPU training configuration.

Use:

- model: yolov8n.pt
- imgsz: 640
- device: cpu
- batch: conservative CPU-compatible batch size
- epochs: 20 initially
- patience: 5
- workers: conservative value suitable for this i3 machine
- pretrained: true

Do NOT use an unnecessarily huge batch size.

--------------------------------------------------
PHASE 4 — TRAIN MODEL A
--------------------------------------------------

Train:

Aloevera + Amla

using:

dataset/yolo/data.yaml

Use a NEW run name:

ayurverify_cpu_2class

DO NOT overwrite:

runs/ayurverify_yolov8n/
or any existing smoke-test results.

After training:

- save best.pt
- save last.pt
- save training results
- save metrics
- preserve the complete run directory

--------------------------------------------------
PHASE 5 — TRAIN MODEL B
--------------------------------------------------

After Model A completes successfully, train:

Ashwagandha + Tulshi + Bel

using:

dataset/yolo_mpbd18/data.yaml

Use a NEW run name:

ayurverify_cpu_3class

DO NOT overwrite the previous MPBD-18 smoke-test run.

Again preserve:

- best.pt
- last.pt
- results
- metrics
- confusion matrix
- validation results
- plots

--------------------------------------------------
PHASE 6 — EVALUATION
--------------------------------------------------

After each model finishes, run validation/test evaluation.

Record:

- Precision
- Recall
- mAP50
- mAP50-95
- per-class metrics
- inference speed
- training duration
- best epoch
- final epoch
- CPU information

Then run inference on representative unseen test images from EACH class.

For Model A test:

Aloevera
Amla

For Model B test:

Ashwagandha
Tulshi
Bel

Save visual prediction images showing:

- bounding boxes
- predicted class
- confidence score

--------------------------------------------------
PHASE 7 — BACKEND COMPATIBILITY
--------------------------------------------------

DO NOT replace the currently integrated model yet.

After training finishes, verify that each generated best.pt can be loaded successfully by Ultralytics.

Confirm the exact model paths.

DO NOT modify FastAPI production inference logic unless absolutely necessary.

We will decide later which model architecture/integration strategy to use.

--------------------------------------------------
PHASE 8 — BENCHMARK
--------------------------------------------------

Measure the actual CPU training time.

Record:

- total training duration
- average epoch duration
- validation duration
- inference latency
- CPU used
- RAM usage if available

This is important because the same training will later be run on the NVIDIA RTX 2050.

The benchmark MUST clearly state:

CURRENT MACHINE = HP Intel i3 CPU

Do not treat this benchmark as the final production benchmark.

--------------------------------------------------
PHASE 9 — GPU PORTABILITY
--------------------------------------------------

The resulting model files MUST remain portable.

Do not hardcode:

- CPU paths
- GPU paths
- CUDA paths
- machine usernames
- absolute Windows paths

The trained:

best.pt

must be usable later on the NVIDIA RTX 2050 machine.

When moved to the RTX 2050 machine, we should be able to:

1. Load the same best.pt
2. Run inference
3. Continue training if required
4. Train a fresh GPU version for comparison

--------------------------------------------------
PHASE 10 — FINAL REPORT
--------------------------------------------------

After everything completes, create/update:

docs/CPU_TRAINING_FINAL_REPORT.md

Include:

1. Machine specifications
2. Environment versions
3. Dataset used
4. Dataset statistics
5. Training configuration
6. Model information
7. Training duration
8. Epoch-by-epoch result summary
9. Precision
10. Recall
11. mAP50
12. mAP50-95
13. Per-class performance
14. Test inference results
15. Model file locations
16. CPU benchmark
17. Known limitations
19. Whether another GPU training run is recommended

At the very end give me a simple status:

MODEL A — Aloevera + Amla
[PASS / FAILED]

MODEL B — Ashwagandha + Tulshi + Bel
[PASS / FAILED]

CPU TRAINING:
[COMPLETED / FAILED]

MODELS CREATED:
[paths]

READY TO MOVE TO RTX 2050:
[YES / NO]

IMPORTANT:
If anything fails, DO NOT silently fix/change the dataset.
Stop at the relevant phase, explain the exact error, and tell me what needs to be done.

START BY INSPECTING THE CURRENT ENVIRONMENT AND DATASET.
THEN PROCEED AUTOMATICALLY THROUGH THE ABOVE PIPELINE.