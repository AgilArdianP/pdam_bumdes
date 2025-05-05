const db = require("../config/db");

exports.logAudit = async (userId, action, description) => {
    try {
        await db.execute(
            "INSERT INTO audit_log (user_id, action, description) VALUES (?, ?, ?)", 
            [userId, action, description]
        );
    } catch (error) {
        console.error("Audit error", error);
    }
};