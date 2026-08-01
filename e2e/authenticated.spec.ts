import { expect, test } from './fixtures/auth';
import { waitForHydrated } from './fixtures/hydration';

/**
 * First authenticated e2e coverage in this repo.
 *
 * Every logged-in surface was previously asserted only through its
 * unauthenticated redirect, because Google OAuth is the sole production sign-in
 * path and Playwright cannot complete it. The gated email provider (see
 * src/lib/auth.ts) closes that gap.
 *
 * Skips automatically when the server runs without ENABLE_TEST_AUTH=1.
 */

const LOGGED_IN_ROUTES = [
  '/daily',
  '/dashboard',
  '/trajectory',
  '/commitments',
  '/bucket-list',
  '/life-plan',
  '/look-back',
  '/settings',
] as const;

test.describe('authenticated surfaces', () => {
  // Serial, not parallel. These tests mutate one shared dev.db as the same user —
  // several add bucket items — so running them concurrently makes them read each
  // other's rows: "Start step 1" could land on another test's item, and any
  // count-based assertion drifts. Playwright defaults to fullyParallel, which is
  // right for read-only specs and wrong for this one.
  test.describe.configure({ mode: 'serial' });

  for (const route of LOGGED_IN_ROUTES) {
    test(`${route} renders for a signed-in user`, async ({ authedPage }) => {
      // Warm the route first. Under `next dev` the first request to a route pays
      // its compile, which made the suite's first authenticated hit flaky in CI.
      // The assertion should measure the response, not the bundler.
      await authedPage.goto(route).catch(() => undefined);
      const res = await authedPage.goto(route);
      expect(res?.status(), `${route} should not error`).toBeLessThan(400);
      // The redirect guard must not fire.
      expect(authedPage.url()).not.toContain('/login');
    });
  }

  test('/daily shows the ritual, not the marketing shell', async ({ authedPage }) => {
    await authedPage.goto('/daily');
    await expect(authedPage.getByText(/Good (morning|evening)/)).toBeVisible();
    await expect(authedPage.getByRole('heading', { name: 'Habits' })).toBeVisible();
  });

  test('the account menu exposes the surfaces it claims to', async ({ authedPage }) => {
    await authedPage.goto('/dashboard');
    // Nav renders the signed-in dropdown rather than a Sign in button.
    await expect(authedPage.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
  });

  test('AM/PM rings derive from journal text, not a separate flag', async ({ authedPage }) => {
    await authedPage.goto('/daily');
    // Both ring labels are always present; the assertion is that the page renders
    // them from journal state without a DailyCheckin row existing.
    await expect(authedPage.getByText('AM', { exact: true })).toBeVisible();
    await expect(authedPage.getByText('PM', { exact: true })).toBeVisible();
  });

  test('the signed-out preview never leaks into a real session', async ({ authedPage }) => {
    // /daily and /trajectory render sample content for anonymous visitors. If
    // that branch ever fired for a signed-in user they would be looking at a
    // stranger's month believing it was their own — the worst failure this
    // feature can have, so it gets its own assertion on both surfaces.
    for (const route of ['/daily', '/trajectory']) {
      await authedPage.goto(route);
      await expect(authedPage.getByLabel('Preview notice')).toHaveCount(0);
      await expect(authedPage.getByText('Read 20 pages')).toHaveCount(0);
      await expect(authedPage.getByText(/Twelve months of runway/)).toHaveCount(0);
    }
  });

  test('a quest can be started AND finished, closing its bucket item', async ({ authedPage }) => {
    // `completeUserQuest` and `abandonQuest` had zero callers app-wide, so the
    // quest lifecycle was one-way: startable, never finishable. Nothing could
    // reach 'completed', which is why the dashboard's completed section, the
    // profile's "The evidence" and four behavioural insights were all
    // permanently empty. This walks the whole loop through the UI.
    await authedPage.goto('/bucket-lists/will-smith');

    const addButton = authedPage
      .getByRole('button', { name: /^Add .+ to my bucket list$/ })
      .first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(authedPage.getByText('Added to your bucket list').first()).toBeVisible();

    await authedPage.goto('/life-plan');
    const start = authedPage.getByRole('button', { name: /Start step 1/ }).first();
    await expect(start, 'a planned bucket item should offer its first quest step').toBeVisible();
    await start.click();

    // Now in progress — and crucially, finishable.
    const markDone = authedPage.getByRole('button', { name: 'Mark done' }).first();
    await expect(markDone, 'an active step must be completable').toBeVisible();
    await markDone.click();

    // The step reports Done rather than staying "In progress" forever.
    await expect(authedPage.getByText('Done', { exact: true }).first()).toBeVisible();

    // And the bucket item must NOT be closed yet. My first version of the
    // quest→bucket edge treated "no quests currently active" as "chain
    // finished", so finishing step 1 of five marked a whole life goal done.
    // The chain card stays on /life-plan (still a planned item) and reports
    // partial progress.
    await expect(authedPage.getByText(/1\/\d+ steps done/).first()).toBeVisible();
  });

  test('the creed can be written, and reaches the surfaces that render it', async ({
    authedPage,
  }) => {
    // `updateCreed` had zero callers, so users.creed was NULL for everyone and
    // the dashboard heading, the public-profile quote and the look-back
    // narrative all permanently took their fallback branch — for the field the
    // code calls "the emotional anchor of the product".
    //
    // The value is unique per run on purpose. This suite shares dev.db with
    // anything else driving localhost:3000, so a colliding writer shows up as an
    // obvious diff rather than a silent pass.
    const creed = `I am someone who finishes what they start. (${Date.now()})`;

    await authedPage.goto('/settings');
    const field = authedPage.getByLabel('Your creed');
    await expect(field).toBeVisible();

    // Wait for React to actually own the textarea before typing into it.
    //
    // It is a controlled component, so a fill that lands before hydration
    // updates the DOM but never the component state; hydration then reverts it,
    // the form compares the creed against an unchanged initial prop, skips the
    // write, and still reports "Profile updated!". `toBeVisible()` only proves
    // the server HTML arrived.
    //
    // See waitForHydrated: a retry-until-it-sticks loop worked locally but timed
    // out in CI, where /settings cold-compiles under two workers.
    await waitForHydrated(field);

    await field.fill(creed);
    await expect(field).toHaveValue(creed);
    await authedPage.getByRole('button', { name: 'Save changes' }).click();

    // Wait for the form's own success signal before navigating: navigating early
    // cancels the in-flight server action and the write is silently lost.
    //
    // The toast, not the redirect. The form only pushes to /u/<username> when the
    // user has a username, which a freshly seeded database's test user does not —
    // so keying on the URL made this pass locally and hang in CI. setToast fires
    // after both updateProfile and updateCreed resolve, which is exactly the
    // condition being waited on.
    await expect(authedPage.getByText('Profile updated!')).toBeVisible();

    // Persisted, not just echoed back by local state.
    await authedPage.goto('/settings');
    await expect(authedPage.getByLabel('Your creed')).toHaveValue(creed);

    await authedPage.goto('/dashboard');
    await expect(authedPage.getByText(creed).first()).toBeVisible();
  });

  test('a bucket item can be advanced, published, and deleted', async ({ authedPage }) => {
    // All four item mutations existed with zero callers, so items were
    // write-once: 'in_progress' was unreachable (leaving /life-plan's "In
    // progress" panel permanently empty), nothing could be made public (leaving
    // the profile's bucket-list block empty for every user), and nothing could
    // be removed. They also revalidated only /dashboard, which does not render
    // bucket items at all.
    // A different source list from the quest-lifecycle test above. The suite runs
    // fullyParallel against one dev.db, so two tests adding the same item title
    // would each see the other's row and the delete assertion would never settle.
    await authedPage.goto('/bucket-lists/richard-branson');
    const add = authedPage.getByRole('button', { name: /^Add .+ to my bucket list$/ }).first();
    // Same hydration trap as the commitments trigger: an unhydrated click is
    // silent, so the toast never fires and this reads as a broken add button.
    await waitForHydrated(add);
    await add.click();
    await expect(authedPage.getByText('Added to your bucket list').first()).toBeVisible();

    await authedPage.goto('/life-plan');

    // Scope every interaction to one item's own control group. The test user may
    // already own other items, so unscoped `.first()` lookups would drift.
    const controls = authedPage.getByRole('group', { name: /^Controls for / }).first();
    await expect(controls, 'a bucket item should expose owner controls').toBeVisible();
    const label = (await controls.getAttribute('aria-label')) as string;
    const scoped = authedPage.getByRole('group', { name: label });

    // Advance it — this status was previously unreachable. Re-resolve through the
    // labelled locator after each router.refresh() so the handle stays attached.
    await scoped.getByRole('button', { name: 'In progress' }).click();
    await expect(scoped.getByRole('button', { name: 'In progress' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Publish it — the only path to the public profile's bucket-list block.
    await scoped.getByRole('button', { name: 'Private' }).click();
    await expect(scoped.getByRole('button', { name: 'Public' })).toBeVisible();

    // And remove it, behind a confirm step.
    await scoped.getByRole('button', { name: /^Remove / }).click();
    await scoped.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(scoped, 'the deleted item should be gone').toHaveCount(0);
  });

  test('a logged stamp shows its proof back, and never as a javascript: link', async ({
    authedPage,
  }) => {
    // Stamp.proofUrl / proofType / note were written on every stamp and rendered
    // nowhere, while the form asked outright for "Proof link" and the completion
    // copy claimed "the stamps live on your profile". The feature whose premise
    // is evidence collected it and never showed it back.
    // Unique per run, and deliberately so. dev.db persists between runs, and a
    // commitment can only be stamped once a day — reusing a fixed hobby name
    // meant the second run of any given day hit "You already have an active
    // commitment for Piano", left the create form sitting on that error, and
    // then had nothing new to stamp. A fresh commitment each run keeps the
    // write path genuinely exercised instead of asserting over yesterday's row.
    const stamp = Date.now();
    const hobby = `Piano ${stamp}`;
    const proofUrl = `https://youtube.com/watch?v=e2e${stamp}`;

    await authedPage.goto('/commitments');

    // No `if (count())` guards around the subject. They let a test skip what it
    // exists to check and still report green, which is how an earlier version
    // "passed" while stamping nothing. Each step waits for the effect of the one
    // before it — clicking a button is not the same as the action completing.
    // The creation form is collapsed behind a trigger, so the name field does
    // not exist until it is opened. The trigger's onClick only exists once
    // React has hydrated — clicking sooner is silent, the form never opens, and
    // the failure surfaces one line later as "name field not found". Retrying
    // the click is not an option: it toggles, so a second one would close it.
    const openCreate = authedPage.getByRole('button', { name: 'Start a commitment' });
    await waitForHydrated(openCreate);
    await openCreate.click();

    const nameField = authedPage.getByPlaceholder('e.g. Guitar, Running, Spanish');
    await expect(nameField).toBeVisible();
    await nameField.fill(hobby);
    await authedPage.getByRole('button', { name: 'Begin commitment' }).click();

    // Scope to this run's card: every active commitment renders its own
    // "Stamp today" button, so an unscoped locator would race the others.
    const card = authedPage.getByRole('group', { name: `${hobby} commitment` });
    await expect(card, 'the new commitment should appear').toBeVisible();

    await card.getByRole('button', { name: 'Stamp today' }).click();

    const proof = card.getByPlaceholder(/or any URL/);
    await expect(proof).toBeVisible();
    await proof.fill(proofUrl);
    await card.getByRole('button', { name: 'Stamp today' }).last().click();

    await expect(card.getByText('The evidence')).toBeVisible();

    // The proof is a real, opener-safe link — and nothing on the page is ever a
    // javascript: href, because normalizeProofUrl stores non-URL input verbatim.
    const proofLink = card.locator(`a[href="${proofUrl}"]`);
    await expect(proofLink).toBeVisible();
    await expect(proofLink).toHaveAttribute('rel', /noopener/);
    await expect(authedPage.locator('a[href^="javascript:"]')).toHaveCount(0);
  });

  test('bucket-list insights render, and a suggestion can be added', async ({ authedPage }) => {
    // src/lib/bucket-list-insights.ts is 368 lines with a full test suite and had
    // zero importers — a finished feature with no door into it. All three
    // generators return null/empty for an empty list, so seed one item first.
    // Seeding, not the subject of this test. dev.db persists between runs, so
    // the item may already be on the list and the famous-list page will then
    // offer no add button at all — hence the count check. Skipping the seed is
    // only safe because the precondition it exists to establish is asserted
    // immediately below rather than assumed.
    await authedPage.goto('/bucket-lists/barack-obama');
    const seed = authedPage.getByRole('button', { name: /^Add .+ to my bucket list$/ }).first();
    if (await seed.count()) {
      await seed.click();
    }

    await authedPage.goto('/life-plan');
    await expect(
      authedPage.getByRole('heading', { name: 'What your list says' }),
      'insights only render for a non-empty list, so seeding must have left one'
    ).toBeVisible();
    await expect(authedPage.getByText(/bucket-list archetype/i)).toBeVisible();
    await expect(authedPage.getByText('Closest famous list')).toBeVisible();
    await expect(authedPage.getByText(/Chosen for the gaps/i)).toBeVisible();

    // A suggestion is only worth showing if it can become a real item, which
    // needed AddToMyListButton's provenance props to become optional.
    //
    // Asserted by the item appearing, not by the button's transient "Added"
    // state: getBucketListSuggestions hashes the existing titles into its
    // shuffle, so adding one re-rolls the panel and that row unmounts. The real
    // confirmation is the item turning up under "Ahead of you" with its own
    // controls.
    // Identified by its own title rather than by a global count, so other items
    // the user owns cannot make this pass or fail by accident.
    const suggestionAdd = authedPage
      .getByRole('button', { name: /^Add .+ to my bucket list$/ })
      .first();
    // The button is named after the item it adds, so its label yields the exact
    // stored title — no scraping the row and stripping the emoji back out.
    const label = (await suggestionAdd.getAttribute('aria-label')) as string;
    const suggestionTitle = label.replace(/^Add /, '').replace(/ to my bucket list$/, '');
    expect(suggestionTitle.length).toBeGreaterThan(3);

    await suggestionAdd.click();

    await expect(async () => {
      await authedPage.goto('/life-plan');
      await expect(
        authedPage.getByRole('group', { name: `Controls for ${suggestionTitle}` }),
        'the added suggestion should become a real bucket item'
      ).toHaveCount(1);
    }).toPass({ timeout: 10_000 });
  });

  test('trajectory offers one focused contract or the existing active one', async ({
    authedPage,
  }) => {
    await authedPage.goto('/trajectory');
    const create = authedPage.getByRole('button', { name: 'Set this trajectory' });
    if (await create.count()) {
      await expect(
        authedPage.getByRole('heading', { name: 'Map the direction, not the destination.' })
      ).toBeVisible();
      await expect(authedPage.getByLabel('Trajectory map')).toBeVisible();
      await expect(authedPage.locator('textarea')).toHaveCount(1);
      await expect(authedPage.getByRole('combobox', { name: /Review rhythm/ })).toBeVisible();
    } else {
      await expect(authedPage.getByText('Current trajectory')).toBeVisible();
      await expect(
        authedPage.getByRole('button', { name: 'Review this trajectory' })
      ).toBeVisible();
    }
  });

  test('trajectory adjusts a contract atomically on D1', async ({ authedPage }) => {
    await authedPage.goto('/trajectory');
    const initialIntent = `Publish one useful artifact each week ${Date.now()}`;
    const create = authedPage.getByRole('button', { name: 'Set this trajectory' });
    if (await create.count()) {
      await authedPage
        .getByRole('textbox', { name: 'Constraints', exact: true })
        .fill('Limited weekday energy');
      await authedPage.getByRole('button', { name: 'Frame intent' }).click();
      await authedPage.getByRole('textbox', { name: 'Intent', exact: true }).fill(initialIntent);
      await authedPage.getByRole('button', { name: 'Frame decision policy' }).click();
      await authedPage
        .getByRole('textbox', { name: 'Decision policy', exact: true })
        .fill('Prefer small finished work');
      await authedPage.getByRole('button', { name: 'Frame feedback loop' }).click();
      await authedPage
        .getByRole('textbox', { name: 'Feedback loop', exact: true })
        .fill('Review friction every Sunday');
      await create.click();
      await expect(authedPage.getByText(initialIntent)).toBeVisible();
    }

    await authedPage.getByRole('button', { name: 'Review this trajectory' }).click();
    const review = authedPage
      .getByRole('heading', { name: 'What did reality tell you?' })
      .locator('xpath=ancestor::section');
    await review.getByLabel('Observed signal').fill('The weekly scope was still too large.');
    await review.getByRole('button', { name: 'Adjust' }).click();

    const revisedIntent = `Publish one useful artifact every two weeks ${Date.now()}`;
    await review.getByRole('button', { name: 'Edit intent' }).click();
    await review.getByRole('textbox', { name: 'Intent', exact: true }).fill(revisedIntent);
    await review.getByRole('button', { name: 'Save and adjust' }).click();

    await expect(authedPage.getByText(revisedIntent).first()).toBeVisible();
    await expect(authedPage.getByRole('heading', { name: 'What changed' })).toBeVisible();
  });
});
