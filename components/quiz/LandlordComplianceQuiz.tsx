'use client'

// components/quiz/LandlordComplianceQuiz.tsx
//
// "Are You Legally Compliant as a California Landlord?" — the client half of
// /resources/california-landlord-quiz. Honestly scored: it tells the owner what
// they got right, and every question (right or wrong) links to the CPM post
// that explains the rule. Wrong answers get the cost stated plainly.
//
// Colors: house tokens only. A miss is marked in gold (--cpm-accent), which
// already carries emphasis on this site; a correct answer is marked in the
// quieter primary-soft blue rather than a second accent.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  LANDLORD_COMPLIANCE_QUESTIONS,
  QUIZ_PHASES,
  type QuizQuestion,
} from './landlord-compliance-questions'

// Tints for feedback panels (rgba of --cpm-primary / --cpm-accent). Inline so
// they don't depend on Tailwind opacity modifiers over CSS variables.
const HIT_TINT = 'rgba(95, 168, 224, 0.10)'
const MISS_TINT = 'rgba(214, 169, 74, 0.12)'

type Stage = 'intro' | 'quiz' | 'results'

function Rail({
  total,
  answered,
  results,
  showResults,
}: {
  total: number
  answered: number
  results: boolean[]
  showResults: boolean
}) {
  return (
    <div className="mb-6 flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        let color = 'var(--cpm-border)'
        if (showResults && results[i] !== undefined)
          color = results[i] ? 'var(--cpm-primary-soft)' : 'var(--cpm-accent)'
        else if (i < answered) color = 'var(--cpm-text)'
        return (
          <div
            key={i}
            className="h-1 flex-1 rounded-sm"
            style={{ background: color }}
          />
        )
      })}
    </div>
  )
}

function PostRef({ post, href }: { post: string; href: string | null }) {
  if (href)
    return (
      <Link
        href={href}
        className="mt-4 inline-block text-sm font-semibold text-[var(--cpm-primary-soft)] underline underline-offset-4 transition hover:text-[var(--cpm-text)]"
      >
        Read the full rule: {post} →
      </Link>
    )
  return (
    <p className="mt-4 text-sm text-[var(--cpm-muted)]">Covered in {post}</p>
  )
}

export default function LandlordComplianceQuiz({
  questions = LANDLORD_COMPLIANCE_QUESTIONS,
}: {
  questions?: QuizQuestion[]
}) {
  const [stage, setStage] = useState<Stage>('intro')
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])

  // Bring the top of the quiz back into view when the question or stage
  // changes — on a phone, "Next question" sits well below the fold.
  const topRef = useRef<HTMLDivElement>(null)
  const hasInteracted = useRef(false)
  useEffect(() => {
    if (!hasInteracted.current) return
    const el = topRef.current
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [idx, stage])

  const total = questions.length
  const q = questions[idx]
  const phaseLabel = QUIZ_PHASES.find((p) => p.key === q?.phase)?.label
  const score = results.filter(Boolean).length

  function start() {
    hasInteracted.current = true
    setStage('quiz')
  }

  function choose(i: number) {
    if (picked !== null) return
    setPicked(i)
    const next = [...results]
    next[idx] = i === q.answer
    setResults(next)
  }

  function advance() {
    if (idx + 1 < total) {
      setIdx(idx + 1)
      setPicked(null)
    } else {
      setStage('results')
    }
  }

  function restart() {
    setStage('intro')
    setIdx(0)
    setPicked(null)
    setResults([])
  }

  // ---------------------------------------------------------------- intro
  if (stage === 'intro')
    return (
      <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
        <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8 md:p-10">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--cpm-text)] md:text-4xl">
            Twenty rules that cost California landlords money.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--cpm-text)]">
            Every question below has a statute behind it and a number attached
            to getting it wrong. They run in the order you hit them: before the
            tenant moves in, during the tenancy, and when it ends.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
            Most owners get somewhere between twelve and sixteen right. The
            score matters less than which four you miss.
          </p>
          <button
            type="button"
            onClick={start}
            className="btn-primary mt-8 cursor-pointer px-7 py-3 text-base"
          >
            Start the assessment
          </button>
          <p className="mt-5 text-sm text-[var(--cpm-muted)]">
            Twenty questions, about six minutes. Nothing is required to see
            your results.
          </p>
        </div>
      </div>
    )

  // -------------------------------------------------------------- results
  if (stage === 'results') {
    const indexed = questions.map((qq, i) => ({ ...qq, i }))
    const misses = indexed.filter((qq) => !results[qq.i])
    const hits = indexed.filter((qq) => results[qq.i])

    return (
      <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
        <Rail total={total} answered={total} results={results} showResults />

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
          Your score
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-5xl">
          {score} of {total}.
        </h2>
        <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
          {misses.length === 0
            ? 'Nothing to correct. That is rare.'
            : misses.length === 1
              ? 'Here is the one worth fixing, and what it costs.'
              : `Here are the ${misses.length} worth fixing, and what each one costs.`}
        </p>

        <div className="mt-8 space-y-4">
          {misses.map((m) => (
            <div
              key={m.i}
              className="rounded-2xl border border-[var(--cpm-border)] border-l-4 p-6"
              style={{ borderLeftColor: 'var(--cpm-accent)', background: MISS_TINT }}
            >
              <p className="text-lg font-semibold leading-7 text-[var(--cpm-text)]">
                {m.q}
              </p>
              <p className="mt-3 leading-7 text-[var(--cpm-text)]">
                <span className="font-semibold">{m.options[m.answer]}</span> —{' '}
                {m.why}
              </p>
              <p className="mt-3 leading-7 text-[var(--cpm-accent)]">{m.cost}</p>
              <PostRef post={m.post} href={m.href} />
            </div>
          ))}
        </div>

        {hits.length > 0 && (
          <div className="mt-14">
            <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
              You had these right
            </h3>
            <p className="mt-2 leading-7 text-[var(--cpm-muted)]">
              Worth reading anyway — most of these are rules where the answer is
              right and the timing is what trips people.
            </p>
            <ul className="mt-6 divide-y divide-[var(--cpm-border)] border-y border-[var(--cpm-border)]">
              {hits.map((h) => (
                <li key={h.i} className="py-5">
                  <p className="leading-7 text-[var(--cpm-text)]">{h.q}</p>
                  <PostRef post={h.post} href={h.href} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-14 rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8 md:p-10">
          <h3 className="text-2xl font-semibold leading-snug text-[var(--cpm-text)] md:text-3xl">
            Want someone else carrying these twenty rules?
          </h3>
          <p className="mt-4 leading-7 text-[var(--cpm-muted)]">
            We manage about 140 doors in Ventura County and every one of these
            questions is a step in our process, not a thing we remember to do.
          </p>
          <Link
            href="/property-strategy-session"
            className="btn-primary mt-6 px-7 py-3 text-base"
          >
            Talk to us about your property
          </Link>
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-8 cursor-pointer rounded-full border border-[var(--cpm-border)] px-5 py-2.5 text-sm text-[var(--cpm-muted)] transition hover:border-[var(--cpm-primary-soft)] hover:text-[var(--cpm-text)]"
        >
          Take it again
        </button>
      </div>
    )
  }

  // ------------------------------------------------------------- question
  const answered = picked !== null
  const correct = picked === q.answer

  return (
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
      <Rail total={total} answered={idx} results={results} showResults={false} />

      <div className="mb-5 flex justify-between text-sm text-[var(--cpm-muted)]">
        <span className="font-semibold uppercase tracking-[0.15em] text-[var(--cpm-primary-soft)]">
          {phaseLabel}
        </span>
        <span>
          {idx + 1} / {total}
        </span>
      </div>

      <h2 className="text-2xl font-semibold leading-snug text-[var(--cpm-text)] md:text-3xl">
        {q.q}
      </h2>

      <div className="mt-7 flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer
          const isPicked = i === picked
          let border = 'var(--cpm-border)'
          let bg = 'var(--cpm-surface)'
          let text = 'var(--cpm-text)'
          if (answered && isAnswer) {
            border = 'var(--cpm-primary-soft)'
            bg = HIT_TINT
          } else if (answered && isPicked) {
            border = 'var(--cpm-accent)'
            bg = MISS_TINT
          } else if (answered) {
            bg = 'transparent'
            text = 'var(--cpm-muted)'
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              aria-pressed={isPicked}
              className={`rounded-xl border px-5 py-4 text-left text-base leading-7 transition ${
                answered
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-[var(--cpm-primary-soft)]!'
              }`}
              style={{ borderColor: border, background: bg, color: text }}
            >
              {answered && isAnswer ? (
                <span className="sr-only">Correct answer: </span>
              ) : null}
              {answered && isPicked && !isAnswer ? (
                <span className="sr-only">Your answer: </span>
              ) : null}
              {opt}
            </button>
          )
        })}
      </div>

      <div aria-live="polite">
        {answered && (
          <div
            className="mt-7 rounded-2xl border-l-4 p-6"
            style={{
              borderLeftColor: correct ? 'var(--cpm-primary-soft)' : 'var(--cpm-accent)',
              background: correct ? HIT_TINT : MISS_TINT,
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{ color: correct ? 'var(--cpm-primary-soft)' : 'var(--cpm-accent)' }}
            >
              {correct ? 'Right.' : 'Not quite.'}
            </p>
            <p className="mt-2 leading-7 text-[var(--cpm-text)]">{q.why}</p>
            <p
              className="mt-3 leading-7"
              style={{ color: correct ? 'var(--cpm-muted)' : 'var(--cpm-accent)' }}
            >
              {q.cost}
            </p>
            <PostRef post={q.post} href={q.href} />
          </div>
        )}
      </div>

      {answered && (
        <button
          type="button"
          onClick={advance}
          className="btn-primary mt-7 w-full cursor-pointer py-3.5 text-base"
        >
          {idx + 1 < total ? 'Next question' : 'See my results'}
        </button>
      )}
    </div>
  )
}
