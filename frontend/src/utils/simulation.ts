import { scoreDistribution } from '../data/analytics';

export interface ThresholdSimulation {
  total: number;
  approved: number;
  reviewed: number;
  blocked: number;
  approvalRate: number;
  reviewRate: number;
  declineRate: number;
  falsePositives: number;
  falseNegatives: number;
  fraudCaught: number;
  detectionRate: number;
  customerFriction: number;
  reviewQueuePerDay: number;
  moneySaved: number;
}

const AVERAGE_FRAUD_VALUE = 1_180;
const SIMULATION_DAYS = 30;

/**
 * Simulates a 30-day window of scored traffic against a review and block threshold.
 * Shared by the threshold simulator, the business impact simulator and Administration
 * so every preview in the platform reports identical numbers.
 */
export function simulateThresholds(reviewThreshold: number, blockThreshold: number): ThresholdSimulation {
  let approved = 0;
  let reviewed = 0;
  let blocked = 0;
  let fraudCaught = 0;
  let falseNegatives = 0;
  let falsePositives = 0;

  scoreDistribution.forEach((bucket) => {
    const midpoint = Number(bucket.band.split('–')[0]) + 5;
    const legit = bucket.count - bucket.fraud;
    if (midpoint >= blockThreshold) {
      blocked += bucket.count;
      fraudCaught += bucket.fraud;
      falsePositives += legit;
    } else if (midpoint >= reviewThreshold) {
      reviewed += bucket.count;
      fraudCaught += bucket.fraud * 0.92;
      falseNegatives += bucket.fraud * 0.08;
      falsePositives += legit * 0.08;
    } else {
      approved += bucket.count;
      falseNegatives += bucket.fraud;
    }
  });

  const total = approved + reviewed + blocked;
  const totalFraud = scoreDistribution.reduce((sum, bucket) => sum + bucket.fraud, 0);

  return {
    total,
    approved,
    reviewed,
    blocked,
    approvalRate: approved / total * 100,
    reviewRate: reviewed / total * 100,
    declineRate: blocked / total * 100,
    falsePositives: Math.round(falsePositives),
    falseNegatives: Math.round(falseNegatives),
    fraudCaught: Math.round(fraudCaught),
    detectionRate: fraudCaught / totalFraud * 100,
    customerFriction: (reviewed + blocked) / total * 100,
    reviewQueuePerDay: Math.round(reviewed / SIMULATION_DAYS),
    moneySaved: Math.round(fraudCaught) * AVERAGE_FRAUD_VALUE
  };
}

export interface BusinessImpactProjection {
  fraudPrevented: number;
  revenueProtected: number;
  reviewWorkload: number;
  clearedPerDay: number;
  backlog: number;
  analystHours: number;
  operationalSavings: number;
  reviewCost: number;
  netBenefit: number;
  roi: number;
}

const COST_PER_REVIEW = 58;
const MANUAL_BASELINE_COST = 96;
const PLATFORM_COST = 1_450_000;

/** Projects the operational and financial consequence of a simulated threshold set. */
export function projectBusinessImpact(
simulation: ThresholdSimulation,
analystCapacityPerDay: number)
: BusinessImpactProjection {
  const clearedPerDay = Math.min(analystCapacityPerDay, simulation.reviewQueuePerDay);
  const backlog = Math.max(0, simulation.reviewQueuePerDay - clearedPerDay);
  const reviewCost = simulation.reviewed * COST_PER_REVIEW;
  const automatedShare = simulation.approved + simulation.blocked;
  const operationalSavings = automatedShare * (MANUAL_BASELINE_COST - 4);
  const revenueProtected = simulation.approved * 2.4;
  const netBenefit = simulation.moneySaved + operationalSavings - reviewCost - PLATFORM_COST / 12;

  return {
    fraudPrevented: simulation.moneySaved,
    revenueProtected,
    reviewWorkload: simulation.reviewQueuePerDay,
    clearedPerDay,
    backlog,
    analystHours: Math.round(clearedPerDay * 3.2 / 60),
    operationalSavings,
    reviewCost,
    netBenefit,
    roi: netBenefit / (PLATFORM_COST / 12)
  };
}