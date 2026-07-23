import { Navigate, useParams } from "react-router-dom";

/** /palette/:id has no dedicated view — it redirects into Explore with the id as a query param. */
export default function PaletteRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/explore?p=${id ?? ""}`} replace />;
}
