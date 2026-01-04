]633;E;{   echo "# Ì≥¶ Mapa del Proyecto ‚Äì App Taxi"\x3b   echo ""\x3b   echo "## Ì∑† Variables, funciones, clases y tipos"\x3b   echo ""\x3b   echo '```ts'\x3b   grep -v -E "CREATE TABLE|ALTER TABLE" proyecto_map.txt\x3b   echo '```'\x3b   echo ""\x3b   echo "## Ì∑ÑÔ∏è Base de Datos (SQLite)"\x3b   echo ""\x3b   echo '```sql'\x3b   grep -E "CREATE TABLE|ALTER TABLE" proyecto_map.txt\x3b   echo '```'\x3b } > docs/proyecto_map.md;f9f351b4-d5a2-4fc0-89aa-2cffaa3d0063]633;C# Ì≥¶ Mapa del Proyecto ‚Äì App Taxi

## Ì∑† Variables, funciones, clases y tipos

```ts
./app/goals/index.tsx:12:export default function GoalsScreen() {
./app/goals/index.tsx:17:  const [daily, setDaily] = useState("");
./app/goals/index.tsx:18:  const [weekly, setWeekly] = useState("");
./app/goals/index.tsx:19:  const [monthly, setMonthly] = useState("");
./app/goals/index.tsx:21:  const [loading, setLoading] = useState(true);
./app/goals/index.tsx:40:  const handleSave = async () => {
./app/goals/index.tsx:101:const styles = StyleSheet.create({
./app/index.tsx:25:type TripRow = {
./app/index.tsx:37:const getProgress = (current: number, goal: number) => {
./app/index.tsx:45:const getStatus = (percent: number | null) => {
./app/index.tsx:55:function ProgressBar({
./app/index.tsx:83:export default function TodayScreen() {
./app/index.tsx:88:  const [activeTripId, setActiveTripId] = useState<number | null>(null);
./app/index.tsx:89:  const [trips, setTrips] = useState<TripRow[]>([]);
./app/index.tsx:91:  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
./app/index.tsx:92:  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);
./app/index.tsx:94:  const [showFinishModal, setShowFinishModal] = useState(false);
./app/index.tsx:95:  const [amountInput, setAmountInput] = useState("");
./app/index.tsx:96:  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
./app/index.tsx:97:  const [source, setSource] = useState<TripSource>(TripSource.TAXI);
./app/index.tsx:99:  const [editingTrip, setEditingTrip] = useState<TripRow | null>(null);
./app/index.tsx:101:  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
./app/index.tsx:103:  const [refreshKey, setRefreshKey] = useState(0);
./app/index.tsx:105:  const [weeklySummary, setWeeklySummary] = useState<any>(null);
./app/index.tsx:106:  const [monthlySummary, setMonthlySummary] = useState<any>(null);
./app/index.tsx:108:  const [showSummary, setShowSummary] = useState(false);
./app/index.tsx:110:  const [showDailySummary, setShowDailySummary] = useState(true);
./app/index.tsx:112:  const [goals, setGoals] = useState<{
./app/index.tsx:118:  const [showGoals, setShowGoals] = useState(false);
./app/index.tsx:121:  const [customSource, setCustomSource] = useState("");
./app/index.tsx:125:  const [chargedAmountInput, setChargedAmountInput] = useState("");
./app/index.tsx:132:  const [workdayInfo, setWorkdayInfo] = useState<{
./app/index.tsx:142:  const [activeWorkday, setActiveWorkday] = useState<{
./app/index.tsx:151:  const [dailySummary, setDailySummary] = useState<{
./app/index.tsx:166:  const refresh = async () => {
./app/index.tsx:167:    const active = await TripService.getActiveTrip();
./app/index.tsx:170:    const tripsForDate = await TripService.getTripsForDate(selectedDate);
./app/index.tsx:174:    const weekSummary = await SummaryService.getWeekSummary();
./app/index.tsx:178:    const monthSummary = await SummaryService.getMonthSummary();
./app/index.tsx:181:    const workday = await TripService.getActiveWorkday();
./app/index.tsx:184:    const wd = await TripService.getWorkdayInfoForDate(selectedDate);
./app/index.tsx:189:      const summary = await TripService.getSummaryForWorkday(wd.id);
./app/index.tsx:212:  const handleStartTrip = async () => {
./app/index.tsx:218:  const handleOpenFinish = () => {
./app/index.tsx:228:  const handleSave = async () => {
./app/index.tsx:229:    const amount = Number(amountInput.replace(",", "."));
./app/index.tsx:232:    const chargedAmountValue =
./app/index.tsx:241:    const finalSource =
./app/index.tsx:295:  const handleDelete = async () => {
./app/index.tsx:313:  const isToday = selectedDate.toDateString() === new Date().toDateString();
./app/index.tsx:320:  const resolvedWorkdayInfo: {
./app/index.tsx:357:  const totalToday = useMemo(() => {
./app/index.tsx:367:  const remainingDaily =
./app/index.tsx:370:  const remainingWeekly =
./app/index.tsx:375:  const remainingMonthly =
./app/index.tsx:383:  const totalsBySource = useMemo(() => {
./app/index.tsx:404:  const totalsByPayment = useMemo(() => {
./app/index.tsx:405:    const efectivo = trips
./app/index.tsx:409:    const tarjeta = trips
./app/index.tsx:419:  const dailyProgress = getProgress(totalToday, goals.daily);
./app/index.tsx:420:  const dailyStatus = getStatus(dailyProgress);
./app/index.tsx:423:  const weeklyProgress = getProgress(weeklySummary?.total ?? 0, goals.weekly);
./app/index.tsx:424:  const weeklyStatus = getStatus(weeklyProgress);
./app/index.tsx:427:  const monthlyProgress = getProgress(
./app/index.tsx:431:  const monthlyStatus = getStatus(monthlyProgress);
./app/index.tsx:906:const styles = StyleSheet.create({
./app/settings/index.tsx:7:export default function NewTripScreen() {
./app/summary/detail.tsx:7:export default function NewTripScreen() {
./app/summary/index.tsx:7:export default function NewTripScreen() {
./app/trip/edit.tsx:7:export default function EditTripScreen() {
./app/trip/new.tsx:7:export default function NewTripScreen() {
./app/_layout.tsx:10:export default function RootLayout() {
./app/_layout.tsx:11:  const [dbReady, setDbReady] = useState(false);
./app/_layout.tsx:14:    async function prepareDatabase() {
./eslint.config.js:2:const { defineConfig } = require('eslint/config');
./eslint.config.js:3:const expoConfig = require('eslint-config-expo/flat');
./metro.config.js:2:const { getDefaultConfig } = require('expo/metro-config');
./metro.config.js:4:/** @type {import('expo/metro-config').MetroConfig} */
./metro.config.js:5:const config = getDefaultConfig(__dirname);
./scripts/reset-project.js:9:const fs = require("fs");
./scripts/reset-project.js:10:const path = require("path");
./scripts/reset-project.js:11:const readline = require("readline");
./scripts/reset-project.js:13:const root = process.cwd();
./scripts/reset-project.js:14:const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
./scripts/reset-project.js:15:const exampleDir = "app-example";
./scripts/reset-project.js:16:const newAppDir = "app";
./scripts/reset-project.js:17:const exampleDirPath = path.join(root, exampleDir);
./scripts/reset-project.js:19:const indexContent = `import { Text, View } from "react-native";
./scripts/reset-project.js:21:export default function Index() {
./scripts/reset-project.js:36:const layoutContent = `import { Stack } from "expo-router";
./scripts/reset-project.js:38:export default function RootLayout() {
./scripts/reset-project.js:43:const rl = readline.createInterface({
./scripts/reset-project.js:48:const moveDirectories = async (userInput) => {
./scripts/reset-project.js:57:    for (const dir of oldDirs) {
./scripts/reset-project.js:58:      const oldDirPath = path.join(root, dir);
./scripts/reset-project.js:61:          const newDirPath = path.join(root, exampleDir, dir);
./scripts/reset-project.js:74:    const newAppDirPath = path.join(root, newAppDir);
./scripts/reset-project.js:79:    const indexPath = path.join(newAppDirPath, "index.tsx");
./scripts/reset-project.js:84:    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
./scripts/reset-project.js:104:    const userInput = answer.trim().toLowerCase() || "y";
./src/constants/enums.ts:6:export enum TripSource {
./src/constants/enums.ts:14:export enum PaymentType {
./src/database/database.ts:10:let db: SQLite.SQLiteDatabase | null = null;
./src/database/database.ts:15:export function getDatabase(): SQLite.SQLiteDatabase {
./src/database/migrations.ts:11:export async function runMigrations() {
./src/database/migrations.ts:12:  const db = await getDatabase();
./src/database/migrations.ts:21:      type TEXT,
./src/database/migrations.ts:84:const columns = await db.getAllAsync<{ name: string }>(
./src/database/migrations.ts:91:const hasChargedAmount = columns.some(
./src/database/migrations.ts:104:const hasWorkdayId = columns.some(
./src/database/migrations.ts:117:const hasCustomSource = columns.some(
./src/database/schema.ts:5:export const WORKDAYS_TABLE = "workdays";
./src/database/schema.ts:11:export const WORKDAYS_SCHEMA = `
./src/database/schema.ts:24:export const ADD_WORKDAY_TO_TRIPS_SCHEMA = `
./src/hooks/use-color-scheme.web.ts:7:export function useColorScheme() {
./src/hooks/use-color-scheme.web.ts:8:  const [hasHydrated, setHasHydrated] = useState(false);
./src/hooks/use-color-scheme.web.ts:14:  const colorScheme = useRNColorScheme();
./src/hooks/use-theme-color.ts:9:export function useThemeColor(
./src/hooks/use-theme-color.ts:13:  const theme = useColorScheme() ?? 'light';
./src/hooks/use-theme-color.ts:14:  const colorFromProps = props[theme];
./src/models/Trip.ts:11:export interface Trip {
./src/services/ExportService.ts:15:export class ExportService {
./src/services/ExportService.ts:17:    const db = await getDatabase();
./src/services/ExportService.ts:19:    const trips = await db.getAllAsync<{
./src/services/ExportService.ts:31:    let csv = "fecha_inicio,hora_inicio,hora_fin,importe,pago,tipo\n";
./src/services/ExportService.ts:33:    for (const t of trips) {
./src/services/ExportService.ts:34:      const start = new Date(t.startTime);
./src/services/ExportService.ts:35:      const end = t.endTime ? new Date(t.endTime) : null;
./src/services/ExportService.ts:42:    const fileUri =
./src/services/GoalService.ts:3:type Goals = {
./src/services/GoalService.ts:9:const STORAGE_KEY = "taxi_goals";
./src/services/GoalService.ts:14:export class GoalService {
./src/services/GoalService.ts:19:    const raw = await AsyncStorage.getItem(STORAGE_KEY);
./src/services/SummaryService.ts:14:export class SummaryService {
./src/services/SummaryService.ts:19:    const { start, end } = getTodayRange();
./src/services/SummaryService.ts:27:    const { start, end } = getCurrentWeekRange();
./src/services/SummaryService.ts:35:    const { start, end } = getCurrentMonthRange();
./src/services/TripService.ts:8:export class TripService {
./src/services/TripService.ts:18:    const db = await getDatabase();
./src/services/TripService.ts:20:    const startTime = new Date().toISOString();
./src/services/TripService.ts:21:    const createdAt = startTime;
./src/services/TripService.ts:23:    const workday = await this.getActiveWorkday();
./src/services/TripService.ts:44:    const db = await getDatabase();
./src/services/TripService.ts:46:    const result = await db.getFirstAsync<{
./src/services/TripService.ts:72:    const db = await getDatabase();
./src/services/TripService.ts:74:    const active = await db.getFirstAsync<{ id: number }>(
./src/services/TripService.ts:86:    const endTime = new Date().toISOString();
./src/services/TripService.ts:91:const finalChargedAmount =
./src/services/TripService.ts:122:    const db = await getDatabase();
./src/services/TripService.ts:138:    const db = await getDatabase();
./src/services/TripService.ts:169:    const workday = await this.getWorkdayForDate(date);
./src/services/TripService.ts:190:    const db = await getDatabase();
./src/services/TripService.ts:192:    const rows = await db.getAllAsync<{
./src/services/TripService.ts:240:    const db = await getDatabase();
./src/services/TripService.ts:242:    const format = (d: Date) => {
./src/services/TripService.ts:243:      const yyyy = d.getFullYear();
./src/services/TripService.ts:244:      const mm = String(d.getMonth() + 1).padStart(2, "0");
./src/services/TripService.ts:245:      const dd = String(d.getDate()).padStart(2, "0");
./src/services/TripService.ts:249:    const rows = await db.getAllAsync<{
./src/services/TripService.ts:262:    let total = 0;
./src/services/TripService.ts:263:    let taxi = 0;
./src/services/TripService.ts:264:    let uber = 0;
./src/services/TripService.ts:265:    let cabify = 0;
./src/services/TripService.ts:266:    let freeNow = 0;
./src/services/TripService.ts:267:    let efectivo = 0;
./src/services/TripService.ts:268:    let tarjeta = 0;
./src/services/TripService.ts:269:    let app = 0;
./src/services/TripService.ts:271:    for (const t of rows) {
./src/services/TripService.ts:272:      const amount = t.amount ?? 0;
./src/services/TripService.ts:310:  const db = await getDatabase();
./src/services/TripService.ts:312:  const rows = await db.getAllAsync<{
./src/services/TripService.ts:326:  let total = 0;
./src/services/TripService.ts:327:  let taxi = 0;
./src/services/TripService.ts:328:  let uber = 0;
./src/services/TripService.ts:329:  let cabify = 0;
./src/services/TripService.ts:330:  let freeNow = 0;
./src/services/TripService.ts:331:  let efectivo = 0;
./src/services/TripService.ts:332:  let tarjeta = 0;
./src/services/TripService.ts:333:  let app = 0;
./src/services/TripService.ts:335:  for (const t of rows) {
./src/services/TripService.ts:336:    const amount = t.amount ?? 0;
./src/services/TripService.ts:337:    const charged = t.chargedAmount ?? amount;
./src/services/TripService.ts:368:    const db = await getDatabase();
./src/services/TripService.ts:369:    const now = new Date().toISOString();
./src/services/TripService.ts:384:    const db = await getDatabase();
./src/services/TripService.ts:385:    const now = new Date().toISOString();
./src/services/TripService.ts:404:    const db = await getDatabase();
./src/services/TripService.ts:406:    const result = await db.getFirstAsync<{
./src/services/TripService.ts:431:    const db = await getDatabase();
./src/services/TripService.ts:432:    const iso = date.toISOString();
./src/services/TripService.ts:434:    const result = await db.getFirstAsync<{
./src/services/TripService.ts:463:  const db = await getDatabase();
./src/services/TripService.ts:466:  const dayStart = new Date(
./src/services/TripService.ts:475:  const dayEnd = new Date(
./src/services/TripService.ts:484:  const row = await db.getFirstAsync<{
./src/services/TripService.ts:523:  const db = await getDatabase();
./src/services/TripService.ts:525:  const workday = await this.getWorkdayForDate(params.startTime);
./src/services/WorkdayService.ts:11:export class WorkdayService {
./src/services/WorkdayService.ts:16:    const db = await getDatabase();
./src/services/WorkdayService.ts:18:    const result = await db.getAllAsync<any>(`
./src/services/WorkdayService.ts:33:    const db = await getDatabase();
./src/services/WorkdayService.ts:35:    const openDay = await this.getOpenWorkday();
./src/services/WorkdayService.ts:38:    const now = new Date().toISOString();
./src/services/WorkdayService.ts:52:    const db = await getDatabase();
./src/services/WorkdayService.ts:53:    const now = new Date().toISOString();
./src/services/WorkdayService.ts:55:    const openDay = await this.getOpenWorkday();
./src/services/WorkdayService.ts:69:    const db = await getDatabase();
./src/services/WorkdayService.ts:71:    const workday = await this.openWorkdayIfNeeded();
./src/utils/dateUtils.ts:11:export type DateRange = {
./src/utils/dateUtils.ts:19:export function getStartOfMonth(date: Date): Date {
./src/utils/dateUtils.ts:26:export function getEndOfMonth(date: Date): Date {
./src/utils/dateUtils.ts:34:export function getMondayOfWeek(date: Date): Date {
./src/utils/dateUtils.ts:35:  const day = date.getDay(); // domingo = 0
./src/utils/dateUtils.ts:36:  const diff = day === 0 ? -6 : 1 - day;
./src/utils/dateUtils.ts:37:  const monday = new Date(date);
./src/utils/dateUtils.ts:45:export function getSundayOfWeek(date: Date): Date {
./src/utils/dateUtils.ts:46:  const monday = getMondayOfWeek(date);
./src/utils/dateUtils.ts:47:  const sunday = new Date(monday);
./src/utils/dateUtils.ts:56:export function getCurrentWeekRange(today: Date = new Date()): DateRange {
./src/utils/dateUtils.ts:57:  const startOfMonth = getStartOfMonth(today);
./src/utils/dateUtils.ts:58:  const endOfMonth = getEndOfMonth(today);
./src/utils/dateUtils.ts:60:  const naturalWeekStart = getMondayOfWeek(today);
./src/utils/dateUtils.ts:61:  const naturalWeekEnd = getSundayOfWeek(today);
./src/utils/dateUtils.ts:63:  const start =
./src/utils/dateUtils.ts:66:  const end =
./src/utils/dateUtils.ts:79:export function getCurrentMonthRange(today: Date = new Date()): DateRange {
./src/utils/dateUtils.ts:89:export function getTodayRange(today: Date = new Date()): DateRange {
```

## Ì∑ÑÔ∏è Base de Datos (SQLite)

```sql
./src/database/migrations.ts:18:    CREATE TABLE IF NOT EXISTS locations (
./src/database/migrations.ts:30:    CREATE TABLE IF NOT EXISTS trips (
./src/database/migrations.ts:55:  CREATE TABLE IF NOT EXISTS workdays (
./src/database/migrations.ts:68:    CREATE TABLE IF NOT EXISTS workdays (
./src/database/migrations.ts:97:    ALTER TABLE trips ADD COLUMN chargedAmount REAL;
./src/database/migrations.ts:110:    ALTER TABLE trips ADD COLUMN workdayId INTEGER;
./src/database/migrations.ts:123:    ALTER TABLE trips ADD COLUMN customSource TEXT;
./src/database/schema.ts:12:CREATE TABLE IF NOT EXISTS workdays (
./src/database/schema.ts:25:ALTER TABLE trips ADD COLUMN workdayId INTEGER;
```
