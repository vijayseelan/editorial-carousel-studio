# Staged scenario animations

Use the `scenarioBars` component when the story depends on quantities moving, combining, splitting, rising, falling or becoming uncertain. Appropriate examples include population change, migration, vote transfer, turnout, coalition arithmetic, demographic composition, budget allocation and sensitivity analysis.

## Narrative grammar

A simulation should normally move through these states:

1. **Measured baseline:** establish the observed quantities on one common scale.
2. **Variable change:** transfer, add, remove, reclassify or grow a defined quantity.
3. **Recomputed outcome:** update totals and ranking while preserving visual object constancy.
4. **Uncertainty or sensitivity:** when the changed quantity is not known, show a range or alternative states rather than one invented number.
5. **Interpretation:** state what changed, what did not, and whether the result is robust.

Not every story needs all five. Use two to five clearly labelled stages. Keep the same bars, colours and spatial positions so viewers can track the quantities rather than relearn the chart.

## Evidence rules

- Distinguish observed counts, assumptions, estimates, forecasts and unknowns in both data and appearance.
- Solid segments represent observed or fixed values.
- Reduced-opacity segments represent estimates.
- Striped segments and whiskers represent uncertain ranges.
- Never animate an assumption as if it were an observed transfer.
- Display the formula or transfer assumption in plain language.
- Use a shared scale across stages unless a scale change is prominently disclosed.
- For vote scenarios, votes belong to voters—not candidates. Model transfer rates as assumptions or ranges.
- For population scenarios, state geography, period, population definition, inflows, outflows and whether components overlap.
- Label simulations “scenario, not forecast” unless they use a validated forecasting model.

## Data shape

Set the slide type to `scenarioBars` and format to `mp4`. The scenario contains two to six stable series and two to five steps. Each bar contains named segments so the renderer can preserve identity across stages.

```json
{
  "type": "scenarioBars",
  "format": "mp4",
  "motion": {"durationSeconds": 12, "finalHoldSeconds": 2},
  "scenario": {
    "unit": "votes",
    "maxValue": 150000,
    "series": [
      {"id": "a", "label": "GROUP A", "colorRole": "gold"},
      {"id": "b", "label": "GROUP B", "colorRole": "accent"}
    ],
    "steps": [
      {
        "label": "OBSERVED BASELINE",
        "note": "Official count",
        "bars": [
          {"id": "a", "segments": [{"id": "base-a", "value": 80000, "certainty": "known", "colorRole": "gold"}]},
          {"id": "b", "segments": [{"id": "base-b", "value": 60000, "certainty": "known", "colorRole": "accent"}]}
        ]
      },
      {
        "label": "TRANSFER RANGE",
        "note": "Assume 10,000–25,000 move from A to B",
        "bars": [
          {"id": "a", "segments": [{"id": "remaining-a", "min": 55000, "max": 70000, "range": true, "certainty": "uncertain", "colorRole": "gold"}]},
          {"id": "b", "segments": [{"id": "base-b", "value": 60000, "certainty": "known", "colorRole": "accent"}, {"id": "from-a", "min": 10000, "max": 25000, "range": true, "certainty": "uncertain", "colorRole": "gold"}]}
        ]
      }
    ]
  }
}
```

For a known segment use `value`. For uncertainty use `min`, `max`, `range: true`, and `certainty: "uncertain"`. Use `totalLabel` when a range should replace the interpolated midpoint label.

## Timing

Complex scenarios usually need 10–16 seconds rather than the standard seven. Allocate a readable hold within each stage and at least two seconds for the final interpretation. The animation should remain understandable when sampled at 0%, 25%, 50%, 75% and 100%.

## QA questions

- Can the viewer identify the measured baseline before assumptions begin?
- Do transferred segments retain colour and identity?
- Are totals recomputed correctly at every stage?
- Could any estimated or unknown value be mistaken for a fact?
- Does a plausible high/low range change the winner, ranking or conclusion?
- Is the conclusion robust, sensitive or indeterminate?
- Is the final state held long enough to read?
