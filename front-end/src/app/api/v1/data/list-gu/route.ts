import { successResponse } from "../../_mock/helpers";
import { getGuList } from "../../_mock/generators";

export async function GET() {
  return successResponse(getGuList());
}
