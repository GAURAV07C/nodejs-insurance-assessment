import { Router } from "express";

import { getPolicyAggregationByUser, searchPolicies } from "../controllers/policy.controller";

const router = Router();

/**
 * @openapi
 * /api/policies/search:
 *   get:
 *     summary: Search policies by username
 *     description: Search insurance policies by a user's first name or email.
 *     tags:
 *       - Policies
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         description: First name or email of the user to search policies for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policies matching the username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       policyNumber:
 *                         type: string
 *                       policyMode:
 *                         type: string
 *                       producer:
 *                         type: string
 *                       premiumAmountWritten:
 *                         type: number
 *                         nullable: true
 *                       premiumAmount:
 *                         type: number
 *                         nullable: true
 *                       policyType:
 *                         type: string
 *                       policyStartDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       policyEndDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       csr:
 *                         type: string
 *                         nullable: true
 *                       user:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           userType:
 *                             type: string
 *                             nullable: true
 *                           firstName:
 *                             type: string
 *                           email:
 *                             type: string
 *                             nullable: true
 *                           gender:
 *                             type: string
 *                             nullable: true
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           city:
 *                             type: string
 *                             nullable: true
 *                           address:
 *                             type: string
 *                             nullable: true
 *                           state:
 *                             type: string
 *                             nullable: true
 *                           zip:
 *                             type: string
 *                             nullable: true
 *                           dob:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           applicantId:
 *                             type: string
 *                             nullable: true
 *                       agent:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           name:
 *                             type: string
 *                       account:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       lob:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           categoryName:
 *                             type: string
 *                       carrier:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           companyName:
 *                             type: string
 *       400:
 *         description: Missing username query parameter
 *       404:
 *         description: No policies found for the given username
 *       500:
 *         description: Failed to search policies
 */
router.get("/search", searchPolicies);

/**
 * @openapi
 * /api/policies/aggregate/users:
 *   get:
 *     summary: Aggregate policy counts by user
 *     description: Returns the total number of policies per user, sorted by policy count descending.
 *     tags:
 *       - Policies
 *     responses:
 *       200:
 *         description: Aggregated policy counts per user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       email:
 *                         type: string
 *                         nullable: true
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                       state:
 *                         type: string
 *                         nullable: true
 *                       totalPolicies:
 *                         type: number
 *       500:
 *         description: Failed to aggregate policies by user
 */
router.get("/aggregate/users", getPolicyAggregationByUser);

export default router;
