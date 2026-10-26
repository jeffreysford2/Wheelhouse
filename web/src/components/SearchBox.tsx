// Header search. Matches brand and model as the visitor types and jumps
// straight to the model page. Follows the ARIA combobox pattern so it works
// with a keyboard and a screen reader.

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { IndexModel } from "../../../shared/carTypes";
import { startingPrice } from "../data/filters";
import { formatPrice } from "../data/format";
import { searchModels } from "../data/search";
import { useIndexData } from "../data/useIndexData";
import "./SearchBox.css";

export function SearchBox() {
  const index = useIndexData();
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(
    () => (index.status === "ready" ? searchModels(index.data.models, query) : []),
    [index, query],
  );
  const showList = isOpen && results.length > 0;

  const goTo = (model: IndexModel) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/cars/${model.id}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      // If the list was closed, the first press just reopens it on the
      // already-highlighted top result instead of skipping past it.
      if (showList) setHighlighted((current) => (current + 1) % results.length);
      else setIsOpen(true);
    } else if (event.key === "ArrowUp" && showList) {
      event.preventDefault();
      setHighlighted((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && showList) {
      event.preventDefault();
      goTo(results[highlighted] ?? results[0]!);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-box">
      <label htmlFor={`${listId}-input`} className="visually-hidden">
        Search by brand or model
      </label>
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${highlighted}` : undefined}
        placeholder="Search brand or model"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlighted(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul id={listId} role="listbox" className="search-results">
          {results.map((model, position) => (
            <li
              key={model.id}
              id={`${listId}-${position}`}
              role="option"
              aria-selected={position === highlighted}
              className="search-result"
              // Keep focus in the input, so it doesn't blur and close the
              // list before this click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => goTo(model)}
              onMouseEnter={() => setHighlighted(position)}
            >
              <span>
                {model.year} {model.make} <strong>{model.name}</strong>
              </span>
              <span className="figures muted">{formatPrice(startingPrice(model))}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
