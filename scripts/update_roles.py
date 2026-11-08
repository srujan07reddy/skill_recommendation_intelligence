import sqlite3
con = sqlite3.connect('backend/ssip_dev.db')
set_id = con.execute("SELECT school_id FROM schools WHERE school_code='SCH-SET'").fetchone()[0]
ssahs_id = con.execute("SELECT school_id FROM schools WHERE school_code='SCH-SSAHS'").fetchone()[0]

con.execute('UPDATE user_roles SET school_id = ? WHERE user_id IN (SELECT user_id FROM users WHERE username = "dean")', (set_id,))
con.execute('UPDATE user_roles SET school_id = ? WHERE user_id IN (SELECT user_id FROM users WHERE username = "hod_cse")', (set_id,))
con.commit()

print("User Roles with School IDs:")
for row in con.execute('SELECT u.username, ur.school_id, ur.department_id FROM users u JOIN user_roles ur ON u.user_id = ur.user_id').fetchall():
    print(row)

