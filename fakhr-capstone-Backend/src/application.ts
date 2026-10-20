import { blockedPlanAI } from './modules/ai/planAI.blocked';
import planDashboardRoutes from './modules/planDashboard/routes';
import { aiActivation } from './modules/ai/ai.activation';
import { minimumRelease, minimumUnavailable, releaseOrigins } from './config/releaseProfile';
import calendarRoutes from "./modules/calendar/calendar.routes";
import dailyCareRoutes from "./modules/dailyCare/dailyCare.routes";
import favoriteRoutes from "./modules/favorites/favorites.routes";
import supportRoutes from "./modules/support/support.routes";
import aiRoutes from './modules/ai/ai.routes';
import { authenticate } from './middlewares/auth.middleware';
import express from "express";
import { configureProxy } from './config/proxy';

import { env } from "./config/env";
import { allowedBrowserOrigins, browserSecurity } from "./config/browserSecurity";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";

import usersRoutes from "./modules/users/users.routes";
import authRoutes from "./modules/auth/auth.routes";
import childrenRoutes from "./modules/children/children.routes";
import communityRoutes from "./modules/community/community.routes";
import servicesRoutes from "./modules/services/services.routes";
import directoryRoutes from "./modules/directory/directory.routes";
import centerRoutes from "./modules/centers/centers.routes";
import helpCenterRoutes from "./modules/helpCenter/helpCenter.routes";
import carePathRoutes from "./modules/carePath/carePath.routes";

export function createApp() {
const app = express();
configureProxy(app, process.env);

app.use(browserSecurity(releaseOrigins(process.env)));
app.use(express.json());
// Never log query strings, request bodies, tokens or passwords.
app.use(morgan(":method :status :response-time ms"));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "Server is running" },
  });
});

// Disabled routes retain their URLs and predictable JSON errors; private gates authenticate first.
app.use(['/api/calendar-events','/api/favorites','/api/support','/api/community','/api/help-center'], (req,res,next)=>{ if(!minimumRelease()) { next(); return; } authenticate(req,res,(error?:unknown)=>{ if(error) { next(error); return; } minimumUnavailable(req,res,next); }); });
app.use(['/api/directory','/api/services','/api/centers','/api/help-center'], (req,res,next)=>{
 if(!minimumRelease() || ['GET','HEAD','OPTIONS'].includes(req.method)) { next(); return; }
 authenticate(req,res,(error?:unknown)=>{ if(error) { next(error); return; } minimumUnavailable(req,res,next); });
});
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/help-center", helpCenterRoutes);
app.use(['/api/care-paths','/api/care-path-tasks'], (req,res,next)=>{
 if(process.env.FAKHR_RELEASE_PROFILE === 'minimum-plan' || !minimumRelease()) { next(); return; }
 authenticate(req,res,(error?:unknown)=>error ? next(error) : minimumUnavailable(req,res,next));
});
app.use("/api", carePathRoutes);

app.use('/api/ai', authenticate, aiActivation, aiRoutes);
app.use('/api/calendar-events', calendarRoutes);
app.use('/api/daily-care', dailyCareRoutes);
app.use('/api/plan-ai', authenticate, blockedPlanAI);
app.use('/api/plan-dashboard',planDashboardRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/support', supportRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

return app;
}



