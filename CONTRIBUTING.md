# Contributing

Contributions that improve evidence handling, layout reliability, accessibility, theme flexibility or explanatory animation are welcome.

## Before opening a change

1. Keep project-specific preferences out of universal skill rules.
2. Do not add copyrighted source documents, client assets or generated production media.
3. Preserve the evidence and creator-approval gates.
4. Do not weaken minimum text sizes, native-scale inspection or layout-audit requirements.
5. Keep renderer examples demonstrative rather than factual claims about real people or events.

## Validation

```bash
python3 -m pip install -r requirements-dev.txt
./scripts/verify-repository.sh
```

If renderer behaviour changes, also create a fresh demonstration project and inspect its contact sheet, native-scale crops and motion strips.

## Pull requests

Describe:

- the failure or workflow gap being addressed;
- the reusable change made;
- how it was tested;
- any compatibility or migration considerations.

