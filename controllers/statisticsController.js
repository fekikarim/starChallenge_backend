const db = require('../config/database');

// Helper function to calculate month-over-month growth
const calculateMonthlyGrowth = async (table) => {
    try {
        // Get the first day of current month
        const now = new Date();
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        // Get the first day of previous month
        const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Date ranges for calculation
        
        // Get current month count
        const currentMonthCount = await new Promise((resolve) => {
            const query = `
                SELECT 
                    COUNT(*) as count,
                    GROUP_CONCAT(created_at) as dates
                FROM ${table} 
                WHERE created_at >= ? AND created_at < ?
            `;
            
            db.get(query, [
                firstDayOfCurrentMonth.toISOString(),
                firstDayOfNextMonth.toISOString()
            ], (err, row) => {
                if (err) {
                    console.error(`Error getting current month count for ${table}:`, err);
                    return resolve(0);
                }
                // Current month count processed
                resolve(row?.count || 0);
            });
        });

        // Get previous month count
        const prevMonthCount = await new Promise((resolve) => {
            const query = `
                SELECT 
                    COUNT(*) as count,
                    GROUP_CONCAT(created_at) as dates
                FROM ${table} 
                WHERE created_at >= ? AND created_at < ?
            `;
            
            db.get(query, [
                firstDayOfPrevMonth.toISOString(),
                firstDayOfThisMonth.toISOString()
            ], (err, row) => {
                if (err) {
                    console.error(`Error getting previous month count for ${table}:`, err);
                    return resolve(0);
                }
                // Previous month count processed
                resolve(row?.count || 0);
            });
        });

        // Calculate growth percentage
        let growth = 0;
        if (prevMonthCount > 0) {
            growth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
        } else if (currentMonthCount > 0) {
            growth = 100; // 100% growth if no previous data
        }
        
        // Growth calculation completed

        return {
            current: currentMonthCount,
            previous: prevMonthCount,
            growth: parseFloat(growth.toFixed(2))
        };
    } catch (error) {
        console.error(`Error calculating monthly growth for ${table}:`, error);
        return { current: 0, previous: 0, growth: 0 };
    }
};

// @desc    Get overview statistics
// @route   GET /api/stats/overview
// @access  Private/Admin
exports.getOverviewStats = async (req, res, next) => {
    try {
        // Get current counts and growth data for all metrics
        const [
            usersData,
            challengesData,
            performancesData,
            rewardsData
        ] = await Promise.all([
            calculateMonthlyGrowth('Utilisateur'),
            calculateMonthlyGrowth('Challenge'),
            calculateMonthlyGrowth('Performance'),
            calculateMonthlyGrowth('Recompense')
        ]);

        // Get total counts
        const getTotalCount = (table) => {
            return new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
                    resolve(err ? 0 : (row?.count || 0));
                });
            });
        };

        const [
            totalUsers,
            totalChallenges,
            totalPerformances,
            totalRewards
        ] = await Promise.all([
            getTotalCount('Utilisateur'),
            getTotalCount('Challenge'),
            getTotalCount('Performance'),
            getTotalCount('Recompense')
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers: parseInt(totalUsers, 10),
                totalChallenges: parseInt(totalChallenges, 10),
                totalPerformances: parseInt(totalPerformances, 10),
                totalRewards: parseInt(totalRewards, 10),
                userGrowth: usersData.growth,
                challengeGrowth: challengesData.growth,
                performanceGrowth: performancesData.growth,
                rewardGrowth: rewardsData.growth,
                monthlyData: {
                    users: usersData,
                    challenges: challengesData,
                    performances: performancesData,
                    rewards: rewardsData
                }
            }
        });
    } catch (err) {
        console.error('Error in getOverviewStats:', err);
        next(err);
    }
};

// @desc    Get challenges statistics
// @route   GET /api/stats/challenges
// @access  Private/Admin
exports.getChallengesStats = async (req, res, next) => {
    try {
        // Get challenges with participant and winner counts using SQLite
        const getChallenges = () => {
            return new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        c.id,
                        c.nom as name,
                        c.dateDebut as startDate,
                        c.dateFin as endDate,
                        c.statut as status,
                        (SELECT COUNT(*) FROM Participant p WHERE p.challengeId = c.id) as participants,
                        (SELECT COUNT(*) FROM Gagnant g WHERE g.challengeId = c.id) as winners
                    FROM Challenge c
                    ORDER BY c.dateDebut DESC
                `, [], (err, rows) => {
                    if (err) {
                        console.error('Error fetching challenges:', err);
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                });
            });
        };

        const challenges = await getChallenges();
        res.status(200).json({
            success: true,
            data: challenges
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get performance statistics
// @route   GET /api/stats/performances
// @access  Private/Admin
exports.getPerformanceStats = async (req, res, next) => {
    try {
        // Get weekly trend data (SQLite version)
        const getWeeklyTrend = () => {
            return new Promise((resolve, reject) => {
                const weeklyTrend = [];
                const today = new Date();
                
                // Get data for the last 7 days
                const promises = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    promises.push(new Promise((res) => {
                        db.get(
                            `SELECT COUNT(*) as count FROM Performance 
                             WHERE date(created_at) = date(?)`, 
                            [dateStr], 
                            (err, row) => {
                                if (err) {
                                    console.error('Error fetching weekly trend:', err);
                                    res({ week: dateStr, value: 0 });
                                } else {
                                    res({ 
                                        week: date.toLocaleDateString('fr-FR', { weekday: 'short' }), 
                                        value: row ? row.count : 0 
                                    });
                                }
                            }
                        );
                    }));
                }
                
                Promise.all(promises).then(results => {
                    // Sort by date (newest first)
                    resolve(results.reverse());
                });
            });
        };

        // Get top performers (SQLite version)
        const getTopPerformers = () => {
            return new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        u.nom as name,
                        AVG(p.valeur) as score
                    FROM Performance p
                    JOIN Participant pa ON pa.id = p.participantId
                    JOIN Utilisateur u ON u.id = pa.utilisateurId
                    GROUP BY u.id
                    ORDER BY score DESC
                    LIMIT 5
                `, [], (err, rows) => {
                    if (err) {
                        console.error('Error fetching top performers:', err);
                        resolve([]);
                    } else {
                        resolve(rows || []);
                    }
                });
            });
        };

        // Get score distribution (SQLite version)
        const getScoreDistribution = () => {
            return new Promise((resolve, reject) => {
                const scoreDistribution = [
                    { range: '0-20', value: 0 },
                    { range: '21-40', value: 0 },
                    { range: '41-60', value: 0 },
                    { range: '61-80', value: 0 },
                    { range: '81-100', value: 0 }
                ];

                // Since SQLite doesn't support CASE in GROUP BY, we'll do it in JavaScript
                db.all(
                    'SELECT valeur FROM Performance', 
                    [], 
                    (err, rows) => {
                        if (err) {
                            console.error('Error fetching scores:', err);
                            resolve(scoreDistribution);
                            return;
                        }

                        // Count scores in each range
                        rows.forEach(row => {
                            const score = row.valeur;
                            let range;
                            
                            if (score <= 20) range = '0-20';
                            else if (score <= 40) range = '21-40';
                            else if (score <= 60) range = '41-60';
                            else if (score <= 80) range = '61-80';
                            else range = '81-100';
                            
                            const rangeObj = scoreDistribution.find(r => r.range === range);
                            if (rangeObj) rangeObj.value++;
                        });
                        
                        resolve(scoreDistribution);
                    }
                );
            });
        };

        // Execute all queries in parallel
        const [weeklyTrend, topPerformers, scoreDistribution] = await Promise.all([
            getWeeklyTrend(),
            getTopPerformers(),
            getScoreDistribution()
        ]);

        res.status(200).json({
            success: true,
            data: {
                weeklyTrend,
                topPerformers: topPerformers.map(p => ({
                    name: p.name,
                    score: Math.round(p.score * 100) / 100
                })),
                scoreDistribution
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get rewards statistics
// @route   GET /api/stats/recompenses
// @access  Private/Admin
exports.getRewardsStats = async (req, res, next) => {
    try {
        // Get rewards by type (SQLite version)
        const getRewardsByType = () => {
            return new Promise((resolve, reject) => {
                db.all(
                    'SELECT type, COUNT(*) as count FROM Recompense GROUP BY type ORDER BY type',
                    [],
                    (err, rows) => {
                        if (err) {
                            console.error('Error fetching rewards by type:', err);
                            resolve([]);
                        } else {
                            resolve(rows || []);
                        }
                    }
                );
            });
        };

        // Get monthly trend for the last 6 months (SQLite version)
        const getMonthlyTrend = () => {
            return new Promise((resolve, reject) => {
                const currentDate = new Date();
                const months = [];
                
                // Generate last 6 months
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const monthKey = date.toISOString().slice(0, 7);
                    const monthName = date.toLocaleString('fr-FR', { month: 'short' });
                    
                    months.push({
                        month: monthName,
                        count: 0 // Will be updated by the query
                    });
                }
                
                // Get counts for each month
                const monthPromises = months.map((monthData, index) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
                    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                    
                    return new Promise((res) => {
                        db.get(
                            `SELECT COUNT(*) as count FROM Recompense 
                             WHERE dateAttribution >= ? AND dateAttribution < ?`,
                            [date.toISOString(), nextMonth.toISOString()],
                            (err, row) => {
                                if (err) {
                                    console.error('Error fetching monthly trend:', err);
                                    res(0);
                                } else {
                                    res(row ? row.count : 0);
                                }
                            }
                        );
                    });
                });
                
                Promise.all(monthPromises).then(counts => {
                    counts.forEach((count, index) => {
                        months[index].count = count;
                    });
                    resolve(months);
                });
            });
        };

        // Execute both queries in parallel
        const [byType, monthlyTrend] = await Promise.all([
            getRewardsByType(),
            getMonthlyTrend()
        ]);

        res.status(200).json({
            success: true,
            data: {
                byType: byType.map(item => ({
                    type: item.type,
                    count: item.count
                })),
                monthlyTrend
            }
        });
    } catch (err) {
        next(err);
    }
};
