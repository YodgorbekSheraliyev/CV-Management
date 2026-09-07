import type { Project } from "../models";
import api, { type CommonResponse } from "./axios";

export const getUserProjects = async (userId: number) => {
  const { data: response } = await api.get<CommonResponse<Project[]>>(
    `/projects/${userId}`,
  );
  return response.data;
};

export const createProject = async (project: Omit<Project, "id">) => {
  const { data: response } = await api.post<CommonResponse<Project>>(
    "/projects",
    project,
  );

  return response.data;
};

export const updateProject = async (project: Project) => {
  const { data: response } = await api.put<CommonResponse<Project>>(
    "/projects",
    project,
  );

  return response.data;
};
export const deleteProject = async (project: Pick<Project, "id">) => {
  await api.delete<void>("/projects", {
    data: project,
  });
};

// import type { Project } from "../models";
// import api, { type CommonResponse } from "./axios";

// // Matches backend.Dtos UpsertProjectDto — tags are names (strings), the server
// // resolves/creates the actual Tag rows. UserId is never sent; the backend derives
// // it from the JWT (ClaimTypes.NameIdentifier), same as every other authenticated write.
// export interface UpsertProjectInput {
//   name: string;
//   startDate: string;
//   endDate: string | null;
//   description: string;
//   tags: string[];
// }

// export const getMyProjects = async () => {
//   const { data: response } =
//     await api.get<CommonResponse<Project[]>>("/api/projects");
//   return response.data;
// };

// export const createProject = async (project: UpsertProjectInput) => {
//   const { data: response } = await api.post<CommonResponse<Project>>(
//     "/api/projects",
//     project,
//   );
//   return response.data;
// };

// export const updateProject = async (
//   id: number,
//   project: UpsertProjectInput,
// ) => {
//   const { data: response } = await api.put<CommonResponse<Project>>(
//     `/api/projects/${id}`,
//     project,
//   );
//   return response.data;
// };

// export const deleteProject = async (id: number) => {
//   await api.delete<void>(`/api/projects/${id}`);
// };
