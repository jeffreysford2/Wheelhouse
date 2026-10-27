import { formatUpdatedDate } from "../data/format";
import { useIndexData } from "../data/useIndexData";
import "./AppFooter.css";

export function AppFooter() {
  const index = useIndexData();
  return (
    <footer className="app-footer">
      <p>
        {index.status === "ready" && <>Prices updated on {formatUpdatedDate(index.data.updatedAt)}. </>}
        Prices are manufacturer suggested retail (MSRP) before destination fees, incentives and dealer markups, so
        what you pay will differ.
      </p>
    </footer>
  );
}
