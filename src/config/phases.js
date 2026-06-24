// The experience is a small state machine. Each phase owns one screen and the
// set of inputs that can move it to the next phase.
//
//   prestart  ->  start  ->  opening  ->  trial 1 -> trial 2 -> trial 3
//                                              \         \         \
//                                               -- yes --+--> yes sequence -> finished
//                                                                  \
//                                            (three no's) -> darkroom -> yes -> finished
//                                                                   \-> no -> explosion
export const PHASES = {
  PRESTART: 'prestart',
  START: 'start',
  OPENING: 'opening',
  TRIAL_1_LOOP: 'trial_1_loop',
  TRIAL_2_LOOP: 'trial_2_loop',
  TRIAL_3_LOOP: 'trial_3_loop',
  DARKROOM_LOOP: 'darkroom_loop',
  YES_SEQUENCE: 'yes_sequence',
  FINISHED: 'finished',
  EXPLOSION: 'explosion',
};

export const TRIAL_PHASES = [
  PHASES.TRIAL_1_LOOP,
  PHASES.TRIAL_2_LOOP,
  PHASES.TRIAL_3_LOOP,
];

export const isTrialPhase = (phase) => TRIAL_PHASES.includes(phase);
