'use client';

import {
  ArrowUp,
  CaretDown,
  ChatText,
  CaretLeft,
  CaretRight,
  PencilSimple,
  SignOut,
  SidebarSimple,
  SquaresFour,
} from '@phosphor-icons/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ChatUserBubble } from '@/components/chat/ChatUserBubble';
import { MatrixLoader } from '@/components/chat/MatrixLoader';
import { TypewriterText } from '@/components/chat/TypewriterText';
import { DSDropdown } from '@/app/onboarding/_components/DSDropdown';
import { DSInput } from '@/app/onboarding/_components/DSInput';
import s from './page.module.css';

import {
  sidebarAgents,
  promptTabs,
  promptData,
  mayaPrompt,
  suggestedAnswers,
  confirmedAnswers,
  myAgentCards,
  demoConfigs,
  type PromptTabKey,
  type DemoKey,
  type AgentStage,
  type MyAgentsTab,
  type MyAgentsActivityTab,
  type AgentCard,
  type BuildPhase,
  type ActiveAgent,
  type DetailTab,
} from './_data';
import {
  getDemoForAgent,
  getFieldDisplayValue,
  getFieldStoredValue,
  getPanelDisplay,
  getStepEditorTitle,
} from './_helpers';
import { AgentDetailStage } from './_components/AgentDetailStage';
import { MyAgentsStage } from './_components/MyAgentsStage';

export default function AgentsWelcomePage() {
  const [stage, setStage] = useState<AgentStage>('welcome');
  const [buildPhase, setBuildPhase] = useState<BuildPhase>('refining');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('workflow');
  const [expandedTx, setExpandedTx] = useState<Set<string>>(new Set());
  const [myAgentsTab, setMyAgentsTab] = useState<MyAgentsTab>('active');
  const [myAgentsActivityTab, setMyAgentsActivityTab] = useState<MyAgentsActivityTab>('activity');
  const toggleTx = (id: string) => setExpandedTx(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [showPanel, setShowPanel] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [chatPushed, setChatPushed] = useState(false);
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<ActiveAgent | null>(null);
  const [activeDemo, setActiveDemo] = useState<DemoKey>('nvda');
  const [promptValue, setPromptValue] = useState('');
  const [conversationPrompt, setConversationPrompt] = useState(mayaPrompt);
  const [isThinking, setIsThinking] = useState(false);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [isCreatingThinking, setIsCreatingThinking] = useState(false);
  const [askingReady, setAskingReady] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionExiting, setQuestionExiting] = useState(false);
  const [questionDir, setQuestionDir] = useState<'next' | 'prev'>('next');
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [askingSubmitted, setAskingSubmitted] = useState(false);
  const [askingBuildThinking, setAskingBuildThinking] = useState(false);
  const [askingResponseVisible, setAskingResponseVisible] = useState(false);
  const [askingPreviewReady, setAskingPreviewReady] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, string>>({});
  const hasNavigatedRef = useRef(false);
  const askingContentRef = useRef<HTMLDivElement>(null);
  const [editingPanelStepId, setEditingPanelStepId] = useState<number | null>(null);
  const [panelEdits, setPanelEdits] = useState<Record<number, Record<string, string>>>({});
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [activePromptTab, setActivePromptTab] = useState<PromptTabKey>('trading');
  const [tabsScrolled, setTabsScrolled] = useState(false);
  const [tabsAtEnd, setTabsAtEnd] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeDemoConfig = demoConfigs[activeDemo];
  const detailDemoConfig = demoConfigs[getDemoForAgent(selectedAgent)];
  const createdAgentCards: AgentCard[] = activeAgents.map((agent) => {
    const config = demoConfigs[getDemoForAgent(agent)];
    return {
      id: agent.id,
      name: agent.name,
      description: config.summary,
      tag: config.tag,
      status: 'active',
      nextStep: config.key === 'cash' ? 'Check brokerage cash balance' : 'Get current portfolio',
    };
  });
  const allAgentCards = [
    ...createdAgentCards,
    ...myAgentCards.filter((agent) => !createdAgentCards.some((created) => created.name === agent.name)),
  ];

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      chatFeedRef.current?.scrollTo({ top: chatFeedRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const updateFade = () => {
      setTabsScrolled(tabs.scrollLeft > 4);
      setTabsAtEnd(tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 4);
    };
    updateFade();
    tabs.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    return () => {
      tabs.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
    };
  }, []);

  useEffect(() => () => clearAllTimers(), []);

  useEffect(() => { scrollToBottom(); }, [stage, buildPhase, visibleBlocks, isThinking, isCreatingThinking]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = askingContentRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [askingSubmitted, askingBuildThinking, askingResponseVisible, askingPreviewReady]);

  const openConversation = (prompt: string) => {
    const nextPrompt = prompt.trim() || mayaPrompt;
    clearAllTimers();
    setConversationPrompt(nextPrompt);
    setPromptValue('');
    setBuildPhase('refining');
    setVisibleBlocks(0);
    setIsThinking(true);

    const lowerPrompt = nextPrompt.toLowerCase();
    const nextDemo: DemoKey | null = lowerPrompt.includes('buy nvda when it drops')
      ? 'nvda'
      : lowerPrompt.includes('too much cash') || lowerPrompt.includes('put it to work') || lowerPrompt.includes('idle cash') || lowerPrompt.includes('sweep any brokerage cash')
        ? 'cash'
        : lowerPrompt.includes('protect my portfolio') || lowerPrompt.includes('market gets scary') || lowerPrompt.includes('vix spike') || lowerPrompt.includes('hedge with spy')
          ? 'hedge'
          : null;

    if (nextDemo) {
      setActiveDemo(nextDemo);
      setPanelEdits({});
      setEditingPanelStepId(null);
      setAskingReady(false);
      setStage('asking');
      setQuestionIndex(0);
      setQuestionExiting(false);
      setQuestionAnswers({});
      setAskingSubmitted(false);
      setAskingBuildThinking(false);
      setAskingResponseVisible(false);
      setAskingPreviewReady(false);
      setSubmittedAnswers({});
      hasNavigatedRef.current = false;
      schedule(() => {
        setIsThinking(false);
        setAskingReady(true);
      }, 4000);
    } else {
      setStage('conversation');
      schedule(() => {
        setIsThinking(false);
        setVisibleBlocks(1); // first block — rest chain via onDone
      }, 1600);
    }
  };

  const buildConfirmationText = (answers: Record<number, string>): string => activeDemoConfig.confirmationText(answers);

  const selectAnswer = (answer: string) => {
    const newAnswers = { ...questionAnswers, [questionIndex]: answer };
    setQuestionAnswers(newAnswers);

    if (questionIndex < activeDemoConfig.questions.length - 1) {
      navigateQuestion('next');
    } else {
      // All questions answered — submit and start build sequence
      setSubmittedAnswers(newAnswers);
      setAskingSubmitted(true);
      schedule(() => setAskingBuildThinking(true), 500);
      schedule(() => {
        setAskingBuildThinking(false);
        setAskingResponseVisible(true);
      }, 500 + 3500);
      schedule(() => setAskingPreviewReady(true), 500 + 3500 + 2200);
    }
  };

  const navigateQuestion = (dir: 'next' | 'prev') => {
    if (questionExiting) return;
    hasNavigatedRef.current = true;
    setQuestionDir(dir);
    setQuestionExiting(true);
    schedule(() => {
      setQuestionIndex(i =>
        dir === 'next'
          ? Math.min(i + 1, activeDemoConfig.questions.length - 1)
          : Math.max(i - 1, 0)
      );
      setQuestionExiting(false);
    }, 180);
  };

  const startCreatingAgent = () => {
    clearAllTimers();
    setIsCreatingThinking(true);
    schedule(() => {
      setIsCreatingThinking(false);
      setBuildPhase('creating');
      schedule(() => setBuildPhase('created'), 1600);
    }, 1000);
  };

  return (
    <main className={s.pageShell}>
      <section className={s.agentFrame} aria-label="Investing agent">
        <aside className={s.agentSidebar} aria-label="Agent navigation">
          <div className={s.sidebarHeader}>
            <div className={s.sidebarLogo}>
              <div className={s.sidebarLogoMarkWrap}>
                <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.sidebarLogoMark} />
              </div>
              <div className={s.sidebarWordmarkWrap}>
                <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.sidebarWordmark} />
              </div>
            </div>
            <button type="button" className={s.iconButton} aria-label="Collapse agent sidebar">
              <div className={s.sidebarIconWrap}>
                <div className={s.sidebarIconInner}>
                  <div className={s.sidebarIconImg}>
                    <img src="/assets/sidebar/icon-columns.svg" alt="" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          <nav className={s.sideNav} aria-label="Agent sections">
            <a
              className={s.sideNavItem}
              href="#new-conversation"
              onClick={() => {
                clearAllTimers();
                setBuildPhase('refining');
                setVisibleBlocks(0);
                setIsThinking(false);
                setIsCreatingThinking(false);
                setStage('welcome');
              }}
            >
              <ChatText weight="regular" />
              <span>New Conversation</span>
            </a>
            <a
              className={s.sideNavItem}
              href="#my-agents"
              aria-current={stage === 'my-agents' ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); setStage('my-agents'); }}
            >
              <SquaresFour weight="fill" />
              <span>My agents</span>
            </a>
          </nav>

          <div className={s.sidebarDivider} />

          <section className={s.activeAgentsBlock} aria-labelledby="active-agents-title">
            <h2 id="active-agents-title" className={s.conversationTitle}>Active agents</h2>
            <div className={s.conversationList}>
              {sidebarAgents.map((agent) => (
                <button key={agent} type="button" className={s.conversationItem}>
                  <span className={s.agentDot} aria-hidden="true" />
                  <span>{agent}</span>
                </button>
              ))}
            </div>
          </section>

          <div className={s.sidebarSpacer} aria-hidden="true" />
          <button type="button" className={s.sidebarExitBtn}>
            <span>Exit</span>
            <SignOut weight="regular" />
          </button>
        </aside>

        <div className={s.mainPanel} data-stage={stage}>
          {stage === 'my-agents' ? (
            <MyAgentsStage
              myAgentsTab={myAgentsTab}
              setMyAgentsTab={setMyAgentsTab}
              myAgentsActivityTab={myAgentsActivityTab}
              setMyAgentsActivityTab={setMyAgentsActivityTab}
              allAgentCards={allAgentCards}
              onSelectAgent={(agent) => { setSelectedAgent(agent); setStage('agent-detail'); }}
            />
          ) : stage === 'agent-detail' && selectedAgent ? (
            <AgentDetailStage
              selectedAgent={selectedAgent}
              detailDemoConfig={detailDemoConfig}
              activeDetailTab={activeDetailTab}
              setActiveDetailTab={setActiveDetailTab}
              expandedTx={expandedTx}
              toggleTx={toggleTx}
              onBack={() => setStage('my-agents')}
            />
          ) : stage === 'welcome' ? (
            <section id="new-conversation" className={s.welcomeSection} aria-labelledby="agent-welcome-title">
              <div className={s.welcomeContent}>
                <div className={s.titleStack}>
                  <img
                    src="/assets/Badge.svg"
                    alt="Surmount AI"
                    className={s.titleBadge}
                  />
                  <h2 id="agent-welcome-title" className={s.welcomeTitle}>
                    Hey Logan, ready to build an agent for your portfolio?
                  </h2>
                </div>

                <form
                  className={s.promptForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    openConversation(promptValue);
                  }}
                >
                  <label className={s.aiPromptWrap}>
                    <span className={s.srOnly}>Define a task for your Agent</span>
                    <div className={s.aiInputUpper}>
                      <textarea
                        className={s.aiInput}
                        placeholder="Define a task for your Agent"
                        value={promptValue}
                        rows={1}
                        onChange={(event) => {
                          setPromptValue(event.target.value);
                          const ta = event.target;
                          ta.style.height = 'auto';
                          ta.style.height = `${ta.scrollHeight}px`;
                        }}
                      />
                    </div>
                    <div className={s.aiInputLower}>
                      <button type="submit" className={s.aiSendBtn} aria-label="Create agent from prompt">
                        <ArrowUp weight="bold" />
                      </button>
                    </div>
                  </label>

                  <div className={[s.promptSuggestions, s.promptSuggestionsVisible].join(' ')}>
                    <div className={s.promptSuggestionsHeader}>
                      <span className={s.promptSuggestionsLabel}>Try recommended prompts</span>
                    </div>
                    <div
                      className={[
                        s.promptTabsWrap,
                        tabsScrolled ? s.promptTabsWrapScrolled : s.promptTabsWrapAtStart,
                        tabsAtEnd ? s.promptTabsWrapAtEnd : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <div ref={tabsRef} className={s.promptTabs}>
                        {promptTabs.map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            className={[
                              s.promptTab,
                              activePromptTab === tab.key ? s.promptTabActive : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => setActivePromptTab(tab.key)}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={s.promptList}>
                      {promptData[activePromptTab].map((prompt, index) => (
                        <button
                          key={`${activePromptTab}-${prompt}`}
                          type="button"
                          className={s.promptItem}
                          style={{ animationDelay: `${index * 42}ms` }}
                          onClick={() => openConversation(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </section>
          ) : stage === 'asking' ? (
            <section className={s.askingStage} aria-label="Follow-up questions">
              {/* Sticky header */}
              <header className={s.askingHeader}>
                <button type="button" className={s.askingHeaderBtn}>
                  <span className={s.askingHeaderTitle}>{activeDemoConfig.headerTitle}</span>
                  <CaretDown weight="regular" className={s.askingHeaderChevron} />
                </button>
              </header>

              {/* Scrollable content */}
              <div ref={askingContentRef} className={s.askingContent}>
                <div className={s.askingMain}>
                  {/* Spacer pushes content to bottom; collapses when content overflows */}
                  <div className={s.askingChatSpacer} aria-hidden="true" />

                  {/* User bubble */}
                  <div className={s.askingUserBubbleRow}>
                    <div className={s.askingUserBubble}>
                      <p>{activeDemoConfig.userBubbleText}</p>
                    </div>
                  </div>

                  {/* Phase 1: 4s thinking */}
                  {!askingReady ? (
                    <MatrixLoader label="Thinking" />
                  ) : askingSubmitted ? null : (
                    <div className={s.questionCard}>
                      <div
                        key={questionExiting ? `exit-${questionIndex}` : `enter-${questionIndex}`}
                        className={[
                          s.questionContent,
                          hasNavigatedRef.current
                            ? questionExiting
                              ? questionDir === 'next' ? s.questionExitNext : s.questionExitPrev
                              : questionDir === 'next' ? s.questionEnterNext : s.questionEnterPrev
                            : '',
                        ].filter(Boolean).join(' ')}
                      >
                        {/* Upper: question text + pagination */}
                        <div className={s.questionCardUpper}>
                          <p className={s.questionText}>
                            {activeDemoConfig.questions[questionIndex].question}
                          </p>
                          <div className={s.pagination}>
                            <button
                              type="button"
                              className={s.paginationBtn}
                              aria-label="Previous question"
                              disabled={questionIndex === 0}
                              onClick={() => navigateQuestion('prev')}
                            >
                              <CaretLeft weight="regular" />
                            </button>
                            <span className={s.paginationCount}>{questionIndex + 1} of {activeDemoConfig.questions.length}</span>
                            <button
                              type="button"
                              className={s.paginationBtn}
                              aria-label="Next question"
                              disabled={questionIndex === activeDemoConfig.questions.length - 1}
                              onClick={() => navigateQuestion('next')}
                            >
                              <CaretRight weight="regular" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        <div className={s.questionCardOptions}>
                          {activeDemoConfig.questions[questionIndex].options.map((opt, i) => {
                            const selected = questionAnswers[questionIndex] === opt;
                            return (
                              <Fragment key={opt}>
                                <button
                                  type="button"
                                  className={[s.questionOption, selected ? s.questionOptionSelected : ''].filter(Boolean).join(' ')}
                                  onClick={() => selectAnswer(opt)}
                                  aria-pressed={selected}
                                >
                                  <span className={[s.optionTag, selected ? s.optionTagSelected : ''].filter(Boolean).join(' ')}>{i + 1}</span>
                                  <span className={s.optionLabel}>{opt}</span>
                                </button>
                                <div className={s.optionDivider} aria-hidden="true" />
                              </Fragment>
                            );
                          })}
                          <div className={s.somethingElseRow}>
                            <button type="button" className={s.somethingElsePencil} aria-label="Type custom answer">
                              <PencilSimple weight="regular" />
                            </button>
                            <span className={s.somethingElseText}>{activeDemoConfig.questions[questionIndex].customLabel}</span>
                            <button
                              type="button"
                              className={s.skipBtn}
                              onClick={() => selectAnswer('skip')}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phase 3: Q&A summary user bubble */}
                  {askingSubmitted && (
                    <div className={s.askingUserBubbleRow}>
                      <div className={[s.askingUserBubble, s.summaryBubble].join(' ')}>
                        {activeDemoConfig.questions.map((q, i) =>
                          submittedAnswers[i] && submittedAnswers[i] !== 'skip' ? (
                            <div key={i} className={s.summaryPair}>
                              <p className={s.summaryQ}>Q: {q.shortLabel}</p>
                              <p className={s.summaryA}>A: {submittedAnswers[i]}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phase 4: 2nd thinking */}
                  {askingBuildThinking && <MatrixLoader label="Thinking" />}

                  {/* Phase 5: Confirmation response */}
                  {askingResponseVisible && (
                    <p className={s.askingResponse}>
                      <TypewriterText
                        speed={18}
                        text={buildConfirmationText(submittedAnswers)}
                        onDone={() => {}}
                      />
                    </p>
                  )}

                  {/* Phase 6: Agent preview card */}
                  {askingPreviewReady && (
                    <div className={s.agentPreviewCard}>
                      <div className={s.agentPreviewBody}>
                        <div className={s.agentPreviewMeta}>
                          <p className={s.agentPreviewEyebrow}>Ready for review</p>
                          <div className={s.agentPreviewTitleGroup}>
                            <h3 className={s.agentPreviewTitle}>{activeDemoConfig.previewTitle}</h3>
                            <p className={s.agentPreviewDesc}>
                              {activeDemoConfig.previewDesc}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={s.agentReviewButton}
                          onClick={() => {
                            setShowPanel(true);
                            requestAnimationFrame(() => requestAnimationFrame(() => {
                              setPanelOpen(true);
                            }));
                          }}
                        >
                          Review agent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer input */}
              <div className={s.askingFooter}>
                <label className={[s.aiPromptWrap, s.askingFooterInput].join(' ')}>
                  <span className={s.srOnly}>Define a task for your agent</span>
                  <div className={s.aiInputUpper}>
                    <textarea
                      className={s.aiInput}
                      placeholder="Define a task for your agent"
                      rows={1}
                    />
                  </div>
                  <div className={s.aiInputLower}>
                    <button type="button" className={s.aiSendBtn} aria-label="Send">
                      <ArrowUp weight="bold" />
                    </button>
                  </div>
                </label>
                <p className={s.askingDisclaimer}>AI models can make mistakes.</p>
              </div>
            </section>
          ) : (
            <section className={[s.chatStage, chatPushed ? s.chatStagePushed : ''].filter(Boolean).join(' ')} aria-labelledby="conversation-stage-title" data-build-phase={buildPhase}>
              <div className={s.chatCanvas}>
                <header className={s.chatHeader}>
                  <button type="button" className={s.chatTitleButton}>
                    <h2 id="conversation-stage-title">Automated NVDA dip buying with weekly limits</h2>
                    <CaretDown weight="bold" />
                  </button>
                </header>

                <div ref={chatFeedRef} className={s.chatFeed} aria-label="Conversation thread">
                  <ChatUserBubble animationDelay={0}>
                    &quot;{conversationPrompt}&quot;
                  </ChatUserBubble>

                  {isThinking && <MatrixLoader label="Thinking" />}

                  {visibleBlocks >= 1 && (
                    <article className={[s.chatMessage, s.chatAssistantMessage].join(' ')}>
                      <div className={[s.chatAnswer, s.strategySpec].join(' ')}>
                        <p>
                          <TypewriterText
                            speed={16}
                            text={'I\'ll build this as a self-contained strategy spec/prototype. A couple of things to flag up front since you do self-directed investing personally: this is a tool design, not financial advice, and "buy automatically on a dip" can run you straight into a falling knife — the weekly cap is doing real work here, so worth being deliberate about the numbers.'}
                            onDone={() => schedule(() => setVisibleBlocks(v => Math.max(v, 2)), 200)}
                          />
                        </p>

                        {visibleBlocks >= 2 && (
                          <section className={s.coreRules} aria-label="The core rules">
                            <h3>
                              <TypewriterText
                                speed={22}
                                text="The core rules"
                                onDone={() => schedule(() => setVisibleBlocks(v => Math.max(v, 3)), 140)}
                              />
                            </h3>
                          </section>
                        )}

                        {visibleBlocks >= 3 && (
                          <section className={s.coreRulesFull} aria-label="The core rules detail">
                            <p><strong>Trigger:</strong>{' '}<TypewriterText speed={14} text="NVDA's intraday change ≤ -X% (you pick X, e.g. -3%) vs. prior close." /></p>
                            <p><strong>Buy:</strong>{' '}<TypewriterText speed={14} text="fixed dollar amount $B per fire (e.g. $250)." /></p>
                            <p><strong>Weekly cap:</strong>{' '}<TypewriterText speed={14} text="total deployed in a rolling 7-day window can't exceed $C (e.g. $1,000). If a trigger would breach the cap, it either buys a partial amount up to the cap or skips — your call." /></p>
                            <p><strong>Notify:</strong>{' '}<TypewriterText speed={14} text="every fire (and ideally every skip-due-to-cap, so you know the cap is binding)." onDone={() => schedule(() => setVisibleBlocks(v => Math.max(v, 4)), 200)} /></p>
                          </section>
                        )}

                        {visibleBlocks >= 4 && (
                          <section className={s.designDecisions} aria-label="Design decisions">
                            <p><TypewriterText speed={15} text="A few design decisions worth making explicit before you wire this to a real broker:" /></p>
                            <ul>
                              <li><strong>One fire per day, or multiple?</strong>{' '}<TypewriterText speed={14} text="If NVDA is down 3% at 10am and down 6% at 2pm, do you want one buy or another buy if the cap allows it?" /></li>
                              <li><strong>Partial fills near the cap.</strong>{' '}<TypewriterText speed={14} text="If only $800 remains in the weekly budget, decide whether to buy $800 or skip." onDone={() => schedule(() => setVisibleBlocks(v => Math.max(v, 5)), 300)} /></li>
                            </ul>
                          </section>
                        )}

                        {visibleBlocks >= 5 && (
                          <div className={s.quickReplies} aria-label="Suggested answers">
                            {suggestedAnswers.map((answer) => (
                              <button key={answer} type="button" onClick={startCreatingAgent}>
                                {answer}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  )}

                  {isCreatingThinking && <MatrixLoader label="Working" />}

                  {buildPhase !== 'refining' ? (
                    <>
                      <ChatUserBubble animationDelay={0}>
                        {confirmedAnswers.join(' · ')}
                      </ChatUserBubble>

                      <article className={[s.chatMessage, s.chatAssistantMessage, s.creationMessage].join(' ')}>
                        <div className={s.creationAnswer}>
                          <div className={s.agentPreviewCard}>
                            <div className={s.agentPreviewBody}>
                              <div className={s.agentPreviewMeta}>
                                <p className={s.agentPreviewEyebrow}>
                                  {buildPhase === 'creating' ? 'Previewing agent' : 'Ready for review'}
                                </p>
                                <div className={s.agentPreviewTitleGroup}>
                                  <h3 className={s.agentPreviewTitle}>NVDA dip-buying agent</h3>
                                  <p className={s.agentPreviewDesc}>
                                    Buy $2,000 of NVDA when it drops 5% from the previous close,
                                    stop after $4,000 each Monday-reset week, and email every fill.
                                  </p>
                                </div>
                              </div>
                              <button type="button" className={s.agentReviewButton} onClick={() => {
                                setShowPanel(true);
                                // double-rAF: mount first, then start width transition
                                requestAnimationFrame(() => requestAnimationFrame(() => {
                                  setPanelOpen(true);
                                  setChatPushed(true);
                                  setTimeout(() => setChatPushed(false), 600);
                                }));
                              }}>
                                Review agent
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    </>
                  ) : null}
                </div>

                <form
                  className={s.chatComposer}
                  onSubmit={(event) => {
                    event.preventDefault();
                    startCreatingAgent();
                  }}
                  aria-label="Reply to clarifying questions"
                >
                  <label className={s.chatComposerWrap}>
                    <span className={s.srOnly}>Answer the questions to continue</span>
                    <input placeholder="Write a message..." />
                    <button type="submit" aria-label="Send reply">
                      <ArrowUp weight="bold" />
                    </button>
                  </label>
                  <p className={s.chatDisclosure}>AI models can make mistakes.</p>
                </form>
              </div>
            </section>
          )}

          {showPanel && (
            <div
              className={s.agentPanel}
              role="dialog"
              aria-label="Review your Agent"
              style={{ width: panelOpen ? 600 : 0 }}
            >
              <div className={s.agentPanelInner}>
              <div className={s.agentPanelHeader}>
                <span className={s.agentPanelTitle}>Review your Agent</span>
                <button type="button" className={s.agentPanelClose} onClick={() => {
                  setPanelOpen(false);
                  setEditingPanelStepId(null);
                  schedule(() => setShowPanel(false), 480);
                }} aria-label="Close panel">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
                </button>
              </div>

              <div className={s.agentPanelBody}>
                <div className={s.agentPanelHero}>
                  <div className={s.agentPanelNameRow}>
                    <h2 className={s.agentPanelName}>{activeDemoConfig.panelName}</h2>
                    <span className={s.agentPanelTag}>{activeDemoConfig.tag}</span>
                  </div>
                  <p className={s.agentPanelSummary}>
                    {activeDemoConfig.summary}
                  </p>
                </div>

                <div className={s.agentSteps}>
                  {activeDemoConfig.legs[0].steps.map((step, i) => {
                    const stepId = step.id;
                    const isEditing = editingPanelStepId === stepId;
                    const isCondition = !!getPanelDisplay(activeDemo, stepId, panelEdits).ifCondition;
                    const canEdit = activeDemoConfig.editableSteps.includes(stepId);
                    const fields = activeDemoConfig.panelFields[stepId] ?? [];
                    const display = getPanelDisplay(activeDemo, stepId, panelEdits);

                    const openEditor = () => {
                      const defaults: Record<string, string> = {};
                      fields.forEach(f => { defaults[f.key] = panelEdits[stepId]?.[f.key] ?? f.default; });
                      setDraftValues(defaults);
                      setEditingPanelStepId(stepId);
                    };

                    const saveEdits = () => {
                      setPanelEdits(prev => ({ ...prev, [stepId]: { ...(prev[stepId] ?? {}), ...draftValues } }));
                      setEditingPanelStepId(null);
                    };

                    return (
                      <div
                        key={stepId}
                        className={[
                          s.agentStepWrap,
                          isEditing ? s.agentStepWrapEditing : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <div className={s.agentStepRow}>
                          <span className={[s.agentStepNum, isEditing ? s.agentStepNumEditing : ''].filter(Boolean).join(' ')}>
                            {stepId}
                          </span>
                          <div
                            className={[
                              s.agentStepCard,
                              isEditing ? s.agentStepCardEditing : canEdit ? s.agentStepCardHoverable : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => { if (!isEditing && canEdit) openEditor(); }}
                            role={!isEditing && canEdit ? 'button' : undefined}
                            tabIndex={!isEditing && canEdit ? 0 : undefined}
                            onKeyDown={e => { if (!isEditing && canEdit && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openEditor(); } }}
                          >
                            {!isEditing ? (
                              <>
                                {isCondition ? (
                                  <div className={s.agentStepBranches}>
                                    <span className={s.agentBranchCondition}>{display.ifCondition}</span>
                                    <div className={s.agentBranchRow}>
                                      <div className={s.agentBranchContent}>
                                        <span className={s.agentStepLabel}>{display.thenLabel}</span>
                                        {display.thenMeta && <span className={s.agentStepMeta}>{display.thenMeta}</span>}
                                      </div>
                                    </div>
                                    <div className={s.agentBranchDivider} aria-hidden="true" />
                                    <div className={s.agentBranchRow}>
                                      <span className={s.agentBranchTagElse}>Else</span>
                                      <div className={s.agentBranchContent}>
                                        <span className={[s.agentStepLabel, s.agentStepLabelMuted].join(' ')}>{display.elseLabel}</span>
                                        {display.elseMeta && <span className={s.agentStepMeta}>{display.elseMeta}</span>}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={s.agentStepInline}>
                                    <span className={s.agentStepLabel}>{display.title}</span>
                                    {display.meta && <span className={s.agentStepMeta}>{display.meta}</span>}
                                  </div>
                                )}
                                {canEdit && (
                                  <div className={s.editHint} aria-hidden="true">
                                    <PencilSimple weight="regular" />
                                    Edit
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className={s.stepEditorContent} onClick={e => e.stopPropagation()}>
                                <div className={s.stepEditorHeader}>
                                  <span className={s.stepEditorTitle}>
                                    {getStepEditorTitle(activeDemo, stepId, display)}
                                  </span>
                                  <span className={s.stepEditorBadge}>Editing</span>
                                </div>
                                <div
                                  className={s.stepFieldGrid}
                                  style={{ gridTemplateColumns: fields.length === 1 ? '1fr' : '1fr 1fr' }}
                                >
                                  {fields.map(field => (
                                    <div key={field.key} className={s.stepFieldGroup}>
                                      {field.type === 'select' ? (
                                        <div className={s.stepFieldDropdownWrap}>
                                          <DSDropdown
                                            label={field.label}
                                            options={field.options ?? []}
                                            value={draftValues[field.key] ?? field.default}
                                            onChange={value => setDraftValues(prev => ({ ...prev, [field.key]: value }))}
                                          />
                                        </div>
                                      ) : (
                                        <DSInput
                                          label={field.label}
                                          type="text"
                                          suffixText={field.suffix}
                                          value={getFieldDisplayValue(field, draftValues[field.key] ?? field.default)}
                                          onChange={e => {
                                            const value = getFieldStoredValue(field, e.target.value);
                                            setDraftValues(prev => ({ ...prev, [field.key]: value }));
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className={s.stepEditorActions}>
                                  <button type="button" className={s.stepCancelBtn} onClick={() => setEditingPanelStepId(null)}>
                                    Cancel
                                  </button>
                                  <button type="button" className={s.stepSaveBtn} onClick={saveEdits}>
                                    Save changes
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {i < activeDemoConfig.legs[0].steps.length - 1 && (
                          <div className={s.agentStepArrow} aria-hidden="true">
                            <svg viewBox="0 0 12 24" fill="none"><path d="M6 0v20M2 15l4 5 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={s.agentPanelFooter}>
                <button
                  type="button"
                  className={s.agentPanelCta}
                  onClick={() => {
                    const newAgent: ActiveAgent = { id: `${activeDemoConfig.createdIdPrefix}-${Date.now()}`, name: activeDemoConfig.createdAgentName };
                    setActiveAgents(prev => [...prev, newAgent]);
                    // close panel
                    setPanelOpen(false);
                    schedule(() => {
                      setShowPanel(false);
                      setSelectedAgent(newAgent);
                      setStage('agent-detail');
                    }, 480);
                  }}
                >
                  Create Agent →
                </button>
              </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
