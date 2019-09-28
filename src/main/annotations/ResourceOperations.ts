import { Get, Post, Put, Delete } from "../index"

/**
 * GET /
 */
export const GetAll = () => Get("/")
/**
 * GET /{id}
 * @param id when using subresources (/posts/{id}/replies/{id}), use this to distinct the postID from replyID. defaults to "id"
 */
export const GetItem = (id: string = "id") => Get(`/{${id}}`)

/**
 * POST /
 */
export const CreateItem = () => Post("/")

/**
 * PUT /{id}
 * @param id when using subresources (/posts/{id}/replies/{id}), use this to distinct the postID from replyID. defaults to "id"
 */
export const UpdateItem = (id: string = "id") => Put(`/{${id}}`)
/**
 * UPDATE /
 */
export const UpdateAll = () => Put("/")

/**
 * DELETE /{id}
 * @param id when using subresources (/posts/{id}/replies/{id}), use this to distinct the postID from replyID. defaults to "id"
 */
export const DeleteItem = (id: string = "id") => Delete(`/{${id}}`)
/**
 * DELETE /
 */
export const DeleteAll = () => Delete("/")