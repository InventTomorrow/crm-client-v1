import { redirect } from "next/navigation";

// Old single-page URL — kept so bookmarks and existing links still land somewhere.
export default function OrderApiPage() {
  redirect("/channels/api/keys");
}
