// "Add to compare" for one trim. Pressing it again takes the trim back out.

import { MAX_COMPARE_TRIMS } from "./compareList";
import { useCompareList } from "./CompareContext";
import "./CompareButton.css";

type Props = { trimId: string; trimLabel: string };

export function CompareButton({ trimId, trimLabel }: Props) {
  const { has, isFull, add, remove } = useCompareList();
  const isAdded = has(trimId);

  if (isAdded) {
    return (
      <button type="button" className="compare-button is-added" onClick={() => remove(trimId)} aria-label={`Remove ${trimLabel} from compare`}>
        <span aria-hidden="true">✓</span> Added
      </button>
    );
  }
  return (
    <button
      type="button"
      className="compare-button"
      onClick={() => add(trimId)}
      disabled={isFull}
      aria-label={`Add ${trimLabel} to compare`}
      title={isFull ? `You can compare up to ${MAX_COMPARE_TRIMS} trims. Remove one first.` : undefined}
    >
      <span aria-hidden="true">+</span> Compare
    </button>
  );
}
