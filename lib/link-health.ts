import { getProjectById, setProjectLinkHealth } from "../db/repository";
import { probePublicUrl } from "./url-safety";

export async function checkProjectHealth(projectId: string) {
  const project = await getProjectById(projectId);
  if (!project) return null;
  try {
    await probePublicUrl(project.live_url);
    return await setProjectLinkHealth(projectId, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The project could not be reached.";
    return await setProjectLinkHealth(projectId, false, message.slice(0, 180));
  }
}
