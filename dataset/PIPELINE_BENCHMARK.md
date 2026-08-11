# AyurVerify — ML Pipeline Performance Benchmarks

This file tracks the runtime benchmarks of various stages of the machine learning pipeline. It is designed to compare CPU performance with GPU acceleration on different development/target hosts.

---

## 💻 Hardware Specifications (Current Benchmark Run)

* **Date:** 2026-08-11
* **Device Mode:** CPU
* **CPU Model:** `Intel64 Family 6 Model 140 Stepping 2, GenuineIntel`
* **System RAM:** 7.65 GB
* **GPU Model:** `N/A`

---

## ⏱️ Benchmark Measurements (CPU Host)

| Pipeline Phase | Operation / Dataset Size | Duration / Performance | Device |
| :--- | :--- | :---: | :---: |
| **Dataset Scan & Hash** | Scan 404 raw images | 0.1293 seconds | CPU |
| **Deduplication & Copy** | Process 404 images -> 350 unique | ~1.50 seconds | CPU |
| **Automated Annotation** | Estimate total for 350 images | 1.18 seconds | CPU |
| **YOLO Split & CSV Manifest** | Split and create manifests | ~2.50 seconds | CPU |
| **Audit & Validation** | Run coordinate and leakage checks | 0.6743 seconds | CPU |
| **Model Inference** | YOLOv8n single image prediction | 143.18 ms | CPU |
| **Smoke-Test Training** | 3 epochs training | 324.0 seconds (3 epochs @ ~108s/epoch) | CPU |

---

## 🎯 GPU Migration Benchmarks (Future NVIDIA RTX 2050 Host)

*This section will be appended with GPU performance figures once the project is transferred to the RTX 2050 GPU host.*

| Pipeline Phase | Operation / Dataset Size | Duration / Performance | Device |
| :--- | :--- | :---: | :---: |
| **Model Inference** | YOLOv8n single image prediction | *TBD (ms)* | CUDA (RTX 2050) |
| **Full YOLOv8n Training** | 50 epochs training | *TBD (minutes)* | CUDA (RTX 2050) |
| **Validation Audits** | Complete split check | *TBD (seconds)* | CUDA (RTX 2050) |
