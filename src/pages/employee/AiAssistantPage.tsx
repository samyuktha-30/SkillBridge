import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { EmployeeWorkspaceLayout } from '../../layouts/EmployeeWorkspaceLayout';
import { BrandIllustration } from '../../components/common/BrandIllustration';
import { employeeApi } from '../../api/employeeApi';
import { extractApiErrorMessage } from '../../api/axiosClient';
import type { AiChatMessageDto } from '../../types/employee.types';
import { figmaTokens } from '../../theme/skillBridgeTheme';

const modes = [
  { key: 'Ask a Question', icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" /> },
  { key: 'Coding Help', icon: <CodeIcon fontSize="small" /> },
  { key: 'Explain Concept', icon: <FormatListBulletedIcon fontSize="small" /> },
  { key: 'My Mistakes', icon: <EditNoteOutlinedIcon fontSize="small" /> },
  { key: 'Practice Exercise', icon: <PsychologyOutlinedIcon fontSize="small" /> },
];

export function AiAssistantPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('Ask a Question');
  const [messages, setMessages] = useState<AiChatMessageDto[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setError(null);
    try {
      const session = await employeeApi.getChatSession(mode);
      setMessages(session.messages);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    }
  }, [mode]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const sendPrompt = async (promptText: string, overrideMode?: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || sending) return;
    const activeMode = overrideMode || mode;
    if (overrideMode && overrideMode !== mode) {
      setMode(overrideMode);
    }

    setSending(true);
    setError(null);
    setInput('');
    try {
      const res = await employeeApi.sendChatMessage({ mode: activeMode, message: trimmed });
      setMessages((prev) => [...prev, res.userMessage, res.assistantMessage]);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <EmployeeWorkspaceLayout topLabel="AI ASSISTANT">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 0.5 }}>
          AI Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ask questions, get instant help, and learn at your own pace.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 580,
              justifyContent: 'space-between',
            }}
          >
            {/* 5 Mode Tabs */}
            <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2.5, flexWrap: "wrap" }}>
              {modes.map((m) => {
                const active = mode === m.key;
                return (
                  <Button
                    key={m.key}
                    size="small"
                    startIcon={m.icon}
                    variant="outlined"
                    onClick={() => setMode(m.key)}
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: active ? figmaTokens.lavender : 'background.paper',
                      borderColor: active ? '#8B5CF6' : 'divider',
                      color: 'text.primary',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {m.key}
                  </Button>
                );
              })}
            </Stack>

            {/* Chat Thread */}
            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 420, pr: 0.5, mb: 2 }}>
              {!messages.length ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Start a conversation in <strong>{mode}</strong> mode. Your chat history is persisted in SQL Server and powered by Gemini.
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'User';
                  return (
                    <Stack key={msg.id} direction="row" spacing={1.5} sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: "flex-start" }}>
                      {!isUser && (
                        <Avatar sx={{ width: 34, height: 34, bgcolor: figmaTokens.lavender, color: figmaTokens.navy }}>
                          <SmartToyOutlinedIcon fontSize="small" />
                        </Avatar>
                      )}

                      <Box sx={{ maxWidth: '78%' }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: isUser ? figmaTokens.mint : figmaTokens.lavender,
                            color: figmaTokens.navy,
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {msg.content}
                          </Typography>
                          {msg.codeSnippet && (
                            <Box
                              component="pre"
                              sx={{
                                mt: 1.5,
                                p: 1.5,
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255,255,255,0.65)',
                                border: '1px solid rgba(15,39,68,0.12)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.78rem',
                                overflowX: 'auto',
                              }}
                            >
                              {msg.codeSnippet}
                            </Box>
                          )}
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}
                        >
                          {msg.timestampLabel}
                        </Typography>
                      </Box>

                      {isUser && (
                        <Avatar sx={{ width: 34, height: 34, bgcolor: figmaTokens.mint, color: figmaTokens.navy }}>
                          <PersonOutlinedIcon fontSize="small" />
                        </Avatar>
                      )}
                    </Stack>
                  );
                })
              )}
            </Stack>

            {/* Composer */}
            <Stack component="form" direction="row" spacing={1.5} onSubmit={(e) => {
                e.preventDefault();
                sendPrompt(input);
              }} sx={{ alignItems: "center" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <IconButton
                type="submit"
                disabled={sending || !input.trim()}
                sx={{
                  bgcolor: figmaTokens.emerald,
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  width: 42,
                  height: 40,
                  '&:hover': { bgcolor: figmaTokens.emeraldHover },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.25}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.25}>
                {[
                  { label: 'Create a Practice Exercise', mode: 'Practice Exercise', prompt: 'Create a focused practice exercise based on my current skill gaps.' },
                  { label: 'Summarize My Learning Plan', mode: 'Ask a Question', prompt: 'Summarize my active learning plan and what I should study today.' },
                  { label: 'Check My Assessment Results', mode: 'My Mistakes', prompt: 'Review my recent assessment mistakes and tell me what to fix first.' },
                  { label: 'Get Learning Recommendations', mode: 'Explain Concept', prompt: 'Which core concept will reduce my highest skill gap fastest?' },
                ].map((qa) => (
                  <Grid key={qa.label} size={{ xs: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={() => sendPrompt(qa.prompt, qa.mode)}
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        backgroundColor: figmaTokens.lavender,
                        cursor: 'pointer',
                        height: '100%',
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      <Typography variant="caption" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                        {qa.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>
                    Learning Tips
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                    Learn efficiently with these tips:
                  </Typography>
                  <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                    <Typography variant="caption">• Practice regularly, even for small topics.</Typography>
                    <Typography variant="caption">• Review your assessment mistakes.</Typography>
                    <Typography variant="caption">• Follow your personalized learning plan.</Typography>
                  </Stack>
                  <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/learning-plan')}>
                    View More
                  </Button>
                </Box>
                <BrandIllustration variant="ai-bot" width={68} />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                Related Resources
              </Typography>
              <Paper
                elevation={0}
                onClick={() => navigate('/employee/resources')}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  backgroundColor: figmaTokens.lavender,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" color={figmaTokens.navy} sx={{ fontWeight: 700 }}>
                    Skill-Aligned Course Catalog
                  </Typography>
                  <Typography variant="caption" color={figmaTokens.slate}>
                    SkillBridge Curated Library
                  </Typography>
                </Box>
                <OpenInNewIcon fontSize="small" />
              </Paper>
              <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/employee/resources')}>
                View More Resources
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </EmployeeWorkspaceLayout>
  );
}
