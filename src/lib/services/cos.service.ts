import COS from 'cos-nodejs-sdk-v5'

/**
 * COS上传结果
 */
export interface COSUploadResult {
  key: string
  url: string
  size: number
  mimeType: string
  etag?: string
}

/**
 * COS删除结果
 */
export interface COSDeleteResult {
  success: boolean
  key: string
  error?: string
}

/**
 * COS配置接口
 */
export interface COSConfig {
  SecretId: string
  SecretKey: string
  Bucket: string
  Region: string
  Domain?: string
}

/**
 * 腾讯云COS服务类
 * 提供文件上传、删除等核心功能
 */
export class COSService {
  private cos: COS
  private config: COSConfig

  constructor(config: COSConfig) {
    this.config = config
    this.cos = new COS({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    })
  }

  /**
   * 上传文件到COS
   * @param file 文件对象
   * @param key COS对象键
   * @returns 上传结果
   */
  async uploadFile(file: File, key: string): Promise<COSUploadResult> {
    return new Promise((resolve, reject) => {
      // 将File转换为Buffer (使用现代的 arrayBuffer() 方法)
      file.arrayBuffer()
        .then(arrayBuffer => {
          const buffer = Buffer.from(arrayBuffer)
          
          this.cos.putObject({
            Bucket: this.config.Bucket,
            Region: this.config.Region,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ContentLength: file.size,
          }, (err, data) => {
            if (err) {
              console.error('COS上传失败:', err)
              reject(new Error(`COS上传失败: ${err.message}`))
              return
            }

            // 生成访问URL
            const url = this.config.Domain 
              ? `${this.config.Domain}/${key}`
              : `https://${this.config.Bucket}.cos.${this.config.Region}.myqcloud.com/${key}`

            resolve({
              key,
              url,
              size: file.size,
              mimeType: file.type,
              etag: data.ETag
            })
          })
        })
        .catch(err => {
          console.error('文件读取失败:', err)
          reject(new Error('文件读取失败'))
        })
    })
  }

  /**
   * 删除COS文件
   * @param key COS对象键
   * @returns 删除结果
   */
  async deleteFile(key: string): Promise<COSDeleteResult> {
    return new Promise((resolve) => {
      this.cos.deleteObject({
        Bucket: this.config.Bucket,
        Region: this.config.Region,
        Key: key,
      }, (err) => {
        if (err) {
          console.error('COS删除失败:', err)
          resolve({
            success: false,
            key,
            error: err.message
          })
          return
        }

        resolve({
          success: true,
          key
        })
      })
    })
  }

  /**
   * 批量删除COS文件
   * @param keys COS对象键数组
   * @returns 删除结果数组
   */
  async batchDeleteFiles(keys: string[]): Promise<COSDeleteResult[]> {
    if (keys.length === 0) {
      return []
    }

    // 每次最多删除1000个文件
    const batchSize = 1000
    const results: COSDeleteResult[] = []

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize)
      
      const batchResults = await new Promise<COSDeleteResult[]>((resolve) => {
        const objects = batch.map(key => ({ Key: key }))
        
        this.cos.deleteMultipleObject({
          Bucket: this.config.Bucket,
          Region: this.config.Region,
          Objects: objects,
        }, (err, data) => {
          if (err) {
            console.error('COS批量删除失败:', err)
            // 如果批量删除失败，逐个删除
            const individualResults = batch.map(key => ({
              success: false,
              key,
              error: err.message
            }))
            resolve(individualResults)
            return
          }

          // 处理删除结果
          const results: COSDeleteResult[] = []
          
          // 成功删除的文件
          if (data.Deleted) {
            data.Deleted.forEach(item => {
              results.push({
                success: true,
                key: item.Key
              })
            })
          }

          // 删除失败的文件
          if (data.Error) {
            data.Error.forEach(item => {
              results.push({
                success: false,
                key: item.Key,
                error: item.Message
              })
            })
          }

          resolve(results)
        })
      })

      results.push(...batchResults)
    }

    return results
  }

  /**
   * 检查文件是否存在
   * @param key COS对象键
   * @returns 是否存在
   */
  async headObject(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.cos.headObject({
        Bucket: this.config.Bucket,
        Region: this.config.Region,
        Key: key,
      }, (err) => {
        if (err) {
          if (err.statusCode === 404) {
            resolve(false)
          } else {
            console.error('COS检查文件失败:', err)
            reject(new Error(`COS检查文件失败: ${err.message}`))
          }
          return
        }

        resolve(true)
      })
    })
  }

  /**
   * 获取文件预签名URL
   * @param key COS对象键
   * @param expires 过期时间（秒），默认1小时
   * @returns 预签名URL
   */
  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.getObjectUrl({
        Bucket: this.config.Bucket,
        Region: this.config.Region,
        Key: key,
        Sign: true,
        Expires: expires,
      }, (err, data) => {
        if (err) {
          console.error('获取签名URL失败:', err)
          reject(new Error(`获取签名URL失败: ${err.message}`))
          return
        }

        resolve(data.Url)
      })
    })
  }

  /**
   * 获取COS配置信息
   */
  getConfig(): COSConfig {
    return { ...this.config }
  }
}

// 创建COS服务实例
export function createCOSService(): COSService {
  const config: COSConfig = {
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
    Bucket: process.env.COS_BUCKET!,
    Region: process.env.COS_REGION!,
    Domain: process.env.COS_DOMAIN,
  }

  // 验证配置
  if (!config.SecretId || !config.SecretKey || !config.Bucket || !config.Region) {
    throw new Error('COS配置不完整，请检查环境变量')
  }

  return new COSService(config)
}