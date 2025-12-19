'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CameraPermissionState {
  hasPermission: boolean | null
  isLoading: boolean
  error: string | null
}

interface UseCameraReturn extends CameraPermissionState {
  requestPermission: () => Promise<void>
  stream: MediaStream | null
  stopStream: () => void
  switchCamera: () => Promise<void>
  facingMode: 'user' | 'environment'
}

export function useCamera(): UseCameraReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const streamRef = useRef<MediaStream | null>(null)

  // Check if camera is available
  const checkCameraAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasCamera = devices.some(device => device.kind === 'videoinput')
      if (!hasCamera) {
        throw new Error('No camera found on this device')
      }
    } catch (err) {
      throw new Error('Unable to access device information')
    }
  }, [])

  // Check current permission state
  const checkPermissionState = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }

      await checkCameraAvailability()

      // Check permissions API if available
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
        setHasPermission(result.state === 'granted')
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setHasPermission(result.state === 'granted')
        })
      } else {
        // Permissions API not available, will need to request to know
        setHasPermission(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check camera permissions')
    } finally {
      setIsLoading(false)
    }
  }, [checkCameraAvailability])

  // Request camera permission and get stream
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9 / 16 }, // Vertical video
        },
        audio: true // Include audio for video recording
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setHasPermission(true)
    } catch (err) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Camera permission denied. Please allow camera access to record videos.')
            break
          case 'NotFoundError':
            setError('No camera found. Please connect a camera to record videos.')
            break
          case 'NotReadableError':
            setError('Camera is already in use by another application.')
            break
          default:
            setError('Failed to access camera. Please try again.')
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to access camera')
      }
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }, [facingMode])

  // Stop camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    
    // If stream is active, restart with new camera
    if (streamRef.current) {
      stopStream()
      await requestPermission()
    }
  }, [facingMode, stopStream, requestPermission])

  // Check permissions on mount
  useEffect(() => {
    checkPermissionState()
  }, [checkPermissionState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    hasPermission,
    isLoading,
    error,
    requestPermission,
    stream,
    stopStream,
    switchCamera,
    facingMode
  }
}