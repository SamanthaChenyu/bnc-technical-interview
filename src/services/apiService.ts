import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface ApiOptions {
  type?: 'form-data' | 'json'
}

interface ApiParams {
  [key: string]: string | number | boolean | File
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

const axiosInstance = axios.create({
  baseURL: '',
  withCredentials: false,
  timeout: 5 * 1000,
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // console.log(config)
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    error.message = '網路異常，請稍候重置。'
    console.error('[AxiosError]', error)
    return Promise.reject(error)
  },
)

const getFromData = function (object: ApiParams): FormData {
  console.log(object)
  const form = new FormData()
  for (const key in object) {
    const value = object[key]
    form.append(key, String(value))
  }
  return form
}

export async function post<T = unknown>(
  url: string,
  params: ApiParams,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const data = options.type === 'form-data' ? getFromData(params) : params
    const res = await axiosInstance.post(url, data)
    return {
      data: res.data,
      message: res.statusText,
      success: res.status === 200,
    }
  } catch (err: unknown) {
    const error = err as Error
    error.message = '網路異常'
    return { data: null as T, message: error.message, success: false }
  }
}

export async function get<T = unknown>(url: string, params?: ApiParams): Promise<ApiResponse<T>> {
  try {
    const res = await axiosInstance.get(url, { params })
    return {
      data: res.data,
      message: res.statusText,
      success: res.status === 200,
    }
  } catch (err: unknown) {
    const error = err as Error
    error.message = '網路異常'
    return { data: null as T, message: error.message, success: false }
  }
}

export async function _delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await axiosInstance.delete(url)
    return {
      data: res.data,
      message: res.statusText,
      success: res.status === 200,
    }
  } catch (err: unknown) {
    const error = err as Error
    console.log(error)
    error.message = '網路異常'
    return { data: null as T, message: error.message, success: false }
  }
}
