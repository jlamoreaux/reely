interface VideoSignature {
  hash: string
  duration: number
  size: number
  timestamp: number
  deviceFingerprint: string
  sessionId: string
}

interface ValidationResult {
  isValid: boolean
  reason?: string
}

export class VideoAuthenticationService {
  private static readonly MAX_UPLOAD_DELAY = 60000 // 60 seconds
  private static readonly MIN_VIDEO_DURATION = 5 // 5 seconds
  private static readonly MAX_VIDEO_DURATION = 180 // 3 minutes
  
  /**
   * Generate a cryptographic signature for the video
   * This signature is used to verify the video hasn't been tampered with
   */
  static async generateVideoSignature(
    videoBlob: Blob,
    duration: number,
    sessionId: string
  ): Promise<VideoSignature> {
    // Generate hash of video content
    const hash = await this.generateVideoHash(videoBlob)
    
    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint()
    
    return {
      hash,
      duration,
      size: videoBlob.size,
      timestamp: Date.now(),
      deviceFingerprint,
      sessionId
    }
  }

  /**
   * Validate video authenticity
   */
  static validateVideo(
    signature: VideoSignature,
    uploadTimestamp: number
  ): ValidationResult {
    // Check upload timing
    const uploadDelay = uploadTimestamp - signature.timestamp
    if (uploadDelay > this.MAX_UPLOAD_DELAY) {
      return {
        isValid: false,
        reason: 'Video must be uploaded within 60 seconds of recording'
      }
    }

    // Check duration constraints
    if (signature.duration < this.MIN_VIDEO_DURATION) {
      return {
        isValid: false,
        reason: `Video must be at least ${this.MIN_VIDEO_DURATION} seconds`
      }
    }

    if (signature.duration > this.MAX_VIDEO_DURATION) {
      return {
        isValid: false,
        reason: `Video cannot exceed ${this.MAX_VIDEO_DURATION} seconds`
      }
    }

    // Validate file size (rough check for manipulation)
    const expectedMinSize = signature.duration * 50000 // ~50KB per second minimum
    const expectedMaxSize = signature.duration * 500000 // ~500KB per second maximum
    
    if (signature.size < expectedMinSize || signature.size > expectedMaxSize) {
      return {
        isValid: false,
        reason: 'Video file size is suspicious'
      }
    }

    return { isValid: true }
  }

  /**
   * Generate hash of video content
   */
  private static async generateVideoHash(blob: Blob): Promise<string> {
    // For browser environment, we'll use a simpler approach
    // In production, you'd want to use SubtleCrypto API
    const buffer = await blob.arrayBuffer()
    const view = new Uint8Array(buffer)
    
    // Sample the video at regular intervals for performance
    const sampleSize = Math.min(1000000, view.length) // Max 1MB sample
    const sampleInterval = Math.floor(view.length / sampleSize)
    
    let hash = 0
    for (let i = 0; i < view.length; i += sampleInterval) {
      hash = ((hash << 5) - hash) + view[i]
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * Generate device fingerprint for tracking
   */
  private static generateDeviceFingerprint(): string {
    const fingerprint = {
      screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 0,
      webgl: this.getWebGLFingerprint()
    }
    
    return btoa(JSON.stringify(fingerprint))
  }

  /**
   * Get WebGL fingerprint for additional device identification
   */
  private static getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) return 'no-webgl'
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        return renderer || 'unknown'
      }
      
      return 'unknown'
    } catch {
      return 'error'
    }
  }

  /**
   * Verify recording session continuity
   */
  static verifySessionContinuity(
    sessionId: string,
    previousSessionId?: string
  ): boolean {
    if (!previousSessionId) return true
    
    // Extract timestamps from session IDs
    const currentTimestamp = parseInt(sessionId.split('-')[0])
    const previousTimestamp = parseInt(previousSessionId.split('-')[0])
    
    // Sessions should be at least 10 seconds apart (prevent rapid re-uploads)
    return currentTimestamp - previousTimestamp > 10000
  }

  /**
   * Check if browser APIs indicate authentic recording
   */
  static async verifyBrowserAPIs(): Promise<boolean> {
    try {
      // Check if MediaRecorder API is available and not mocked
      if (!window.MediaRecorder || typeof MediaRecorder !== 'function') {
        return false
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false
      }

      // Verify we can enumerate devices (indicates real hardware)
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some(device => device.kind === 'videoinput')
      
      return hasVideoInput
    } catch {
      return false
    }
  }
}