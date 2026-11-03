import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../App'

function renderHome() {
  return renderAt('/')
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Roblox Plus Invite', () => {
  it('opens a username dialog with cancel and continue actions', () => {
    renderHome()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Join me on Roblox Plus for 30 days free',
      }),
    ).toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: 'Get Invite' })
    expect(trigger).toHaveClass('button-primary')
    expect(window.localStorage.getItem('pd_code')).toMatch(
      /^DEV-[A-Z0-9]{6}$/,
    )

    fireEvent.click(trigger)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByLabelText('Roblox username')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.queryByText(/your referral code/i)).not.toBeInTheDocument()
  })

  it('shows an inline error when the username is empty', () => {
    renderHome()

    fireEvent.click(screen.getByRole('button', { name: 'Get Invite' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      /letters, numbers, or underscores/i,
    )
  })

  it('shows the Roblox avatar and asks for confirmation', async () => {
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      if (input.startsWith('/api/offers')) {
        return Promise.resolve({
          json: async () => ({
            offers: [
              {
                description: 'Complete the survey',
                icon: null,
                id: '70',
                name: 'Survey offer',
                url: 'https://example.com/offer',
              },
            ],
          }),
          ok: true,
        })
      }

      return Promise.resolve({
        json: () =>
          Promise.resolve({
            eligible: true,
            user: {
              id: 1,
              username: 'Builderman',
              displayName: 'Builderman',
              avatarUrl: 'https://tr.rbxcdn.com/builderman-avatar.png',
            },
          }),
        ok: true,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Get Invite' }))
    fireEvent.change(screen.getByLabelText('Roblox username'), {
      target: { value: 'Builderman' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByRole('heading', { name: 'Is this you?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Builderman's Roblox avatar/i }),
    ).toHaveAttribute(
      'src',
      'https://tr.rbxcdn.com/builderman-avatar.png',
    )
    expect(screen.getByText('@Builderman')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /No, not me/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Yes, that's me/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Continue' }),
    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/verify',
      expect.objectContaining({ method: 'POST' }),
    )

    fireEvent.click(screen.getByRole('button', { name: /Yes, that's me/i }))
    expect(
      screen.getByRole('heading', { name: 'Checking your account' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole(
        'button',
        { name: "Verify you're a human" },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: "Verify you're a human" }),
    )
    expect(
      screen.getByRole('heading', { name: "Verifying you're a human" }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Choose an offer' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
    expect(await screen.findByText('Survey offer')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start Survey offer' }),
    ).toHaveAttribute('href', 'https://example.com/offer')
  })

  it('keeps the same invite code after a remount', () => {
    const first = renderHome()
    const firstCode = window.localStorage.getItem('pd_code')

    first.unmount()
    renderHome()

    expect(window.localStorage.getItem('pd_code')).toBe(firstCode)
  })

  it('shows the batch claim progress', () => {
    renderHome()

    const progress = screen.getByRole('progressbar', {
      name: '26 of 100 invite links claimed',
    })
    expect(progress).toHaveAttribute('aria-valuenow', '26')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
    expect(screen.getByText('74 left in this batch')).toBeInTheDocument()
  })

  it('increments the claim count every 10 minutes per browser', () => {
    window.localStorage.setItem(
      'pd_claim_start_v2',
      String(Date.now() - 10 * 60 * 1000 - 1000),
    )
    renderHome()

    expect(
      screen.getByRole('progressbar', {
        name: '27 of 100 invite links claimed',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('73 left in this batch')).toBeInTheDocument()
  })

  it('serves the full page on a branded invite path', () => {
    renderAt('/plus/invite/H5Ig4B')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Join me on Roblox Plus for 30 days free',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /page not found/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('get-invite')).toBeInTheDocument()
  })

  it('links the logo back to the main page', () => {
    renderHome()

    expect(
      screen.getByRole('link', { name: 'Roblox Plus Invite home' }),
    ).toHaveAttribute('href', '/')
    expect(
      within(screen.getByRole('banner')).getByAltText('Roblox'),
    ).toHaveAttribute('src', '/roblox-wordmark.svg')
  })
})
