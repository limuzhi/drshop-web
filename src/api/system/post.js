import request from '@/utils/request'

//获取岗位列表
export function getPostList(query) {
  return request({
    url: '/api/v1/post/list',
    method: 'GET',
    params: query
  })
}

// 查询岗位详细
export function getPostDetail(postId) {
  return request({
    url: '/api/v1/post/detail?postId=' + postId,
    method: 'GET'
  })
}
   
// 新增岗位
export function createPost(data) {
  return request({
    url: '/api/v1/post/create',
    method: 'POST',
    data: data
  })
}

// 修改岗位
export function updatePostById(data) {
  return request({
    url: '/api/v1/post/update',
    method: 'PUT',
    data: data
  })
}

// 批量删除岗位
export function batchDeletePostByIds(data) {
  return request({
    url: '/api/v1/post/delete',
    method: 'delete',
    data: data
  })
}
