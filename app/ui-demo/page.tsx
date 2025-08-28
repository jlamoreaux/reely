'use client'

import React, { useState } from 'react'
import {
  Button,
  IconButton,
  Header,
  Avatar,
  VideoCard,
  Modal,
  Input,
  TextArea,
  Select,
  Checkbox,
  Container,
  Grid,
  Stack,
  ToastProvider,
  useToast,
  SkeletonVideoCard,
} from '@/components/ui'
import { HeartIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'

function DemoContent() {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [checked, setChecked] = useState(false)
  const { showToast } = useToast()
  
  return (
    <Container maxWidth="xl" className="py-8">
      <Stack spacing={8}>
        {/* Header Section */}
        <section>
          <h1 className="text-3xl font-bold text-[#333333] mb-6">Reelly UI Component Library</h1>
          <Header 
            title="Component Demo" 
            subtitle="Workstream 2 Complete"
            showBackButton
            rightAction={
              <Button size="sm" onClick={() => showToast('UI Library Ready!', 'success')}>
                Test Toast
              </Button>
            }
          />
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Buttons</h2>
          <Stack direction="horizontal" spacing={4} wrap>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button isLoading>Loading</Button>
          </Stack>
          
          <div className="mt-4 flex gap-2">
            <IconButton variant="default">
              <HeartIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="primary">
              <ShareIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="ghost">
              <BookmarkIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </section>

        {/* Avatar Section */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Avatars</h2>
          <Stack direction="horizontal" spacing={4} align="center">
            <Avatar size="xs" />
            <Avatar size="sm" />
            <Avatar size="md" isOnline />
            <Avatar size="lg" showBorder />
            <Avatar size="xl" />
          </Stack>
        </section>

        {/* Form Components */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Form Components</h2>
          <Grid cols={{ sm: 1, md: 2 }} gap={6}>
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="We'll never share your email"
              required
            />
            
            <Select
              label="Country"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'ca', label: 'Canada' },
              ]}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            />
            
            <TextArea
              label="Bio"
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={150}
              showCount
              helperText="Keep it brief and authentic"
            />
            
            <div className="flex items-center">
              <Checkbox
                label="I agree to the terms and conditions"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>
          </Grid>
        </section>

        {/* Video Card Section */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Video Cards</h2>
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
            <VideoCard
              thumbnail="https://via.placeholder.com/400x720"
              duration={45}
              user={{
                id: '1',
                name: 'Jane Doe',
                username: 'janedoe',
                isVerified: true,
              }}
              description="Check out this amazing sunset from my balcony! No filters, just pure nature."
              timestamp={new Date()}
              stats={{
                likes: 1234,
                comments: 56,
                views: 8901,
              }}
              isLiked={true}
              onPlay={() => showToast('Playing video...', 'info')}
              onLike={() => showToast('Liked!', 'success')}
              onComment={() => showToast('Opening comments...', 'info')}
              onShare={() => showToast('Sharing...', 'info')}
            />
            
            <SkeletonVideoCard />
            
            <VideoCard
              thumbnail="https://via.placeholder.com/400x720/7C9885/ffffff"
              duration={120}
              user={{
                id: '2',
                name: 'John Smith',
                username: 'johnsmith',
              }}
              description="Morning coffee vibes ☕"
              timestamp="2024-01-15T10:00:00Z"
              stats={{
                likes: 89,
                comments: 12,
                views: 456,
              }}
              onPlay={() => showToast('Playing video...', 'info')}
            />
          </Grid>
        </section>

        {/* Modal Demo */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="md"
          >
            <Stack spacing={4}>
              <p className="text-[#666666]">
                This is a modal component with focus trap, keyboard navigation, and accessibility features.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    showToast('Action confirmed!', 'success')
                    setModalOpen(false)
                  }}
                >
                  Confirm
                </Button>
              </div>
            </Stack>
          </Modal>
        </section>

        {/* Toast Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-[#333333] mb-4">Toast Notifications</h2>
          <Stack direction="horizontal" spacing={4} wrap>
            <Button variant="primary" onClick={() => showToast('Success message!', 'success')}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={() => showToast('Error occurred!', 'error')}>
              Error Toast
            </Button>
            <Button variant="secondary" onClick={() => showToast('Warning message', 'warning')}>
              Warning Toast
            </Button>
            <Button variant="ghost" onClick={() => showToast('Info message', 'info')}>
              Info Toast
            </Button>
          </Stack>
        </section>
      </Stack>
    </Container>
  )
}

export default function UIDemo() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  )
}