DROP TABLE feedback_tbl;

CREATE TABLE mood_entries_tbl (
    entry_ID    INTEGER  PRIMARY KEY AUTO INCREMENT,
    user_ID     INTEGER,
    moods       TEXT     CHECK (moods IN ('rad', 'good', 'meh', 'bad', 'awful') ),
    emotions    TEXT,
    journal     TEXT,
    logged_date DATETIME,
    FOREIGN KEY (
        user_ID
    )
    REFERENCES user_tbl (user_ID) 
);

CREATE TABLE chat_session_tbl (
    chat_session_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INT,
    time_stamp timestamp,
    FOREIGN KEY (user_ID) REFERENCES user_tbl(user_ID)      
);
    CREATE TABLE responses_tbl (
    responses_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_session_ID INTEGER,
    sender TEXT CHECK  (sender IN ('User', 'Moodi')),
    keyword TEXT,
    sentiment_score FLOAT,
    emotion_category TEXT CHECK (emotion_category IN ('joy', 'sadness', 'fear', 'anger')),
    intensity_score FLOAT,
    timestamp DATETIME,
    FOREIGN KEY (chat_session_ID) REFERENCES chat_session_tbl(chat_session_ID)
);

    CREATE TABLE feedback_tbl (
    feedback_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    chat_session_ID INTEGER,
    rating INTEGER,
    feedback_time DATETIME,
    FOREIGN KEY (user_ID) REFERENCES user_tbl(user_ID),       
    FOREIGN KEY (chat_session_ID) REFERENCES chat_session_tbl(chat_session_ID)  
);


CREATE TABLE xp_progress_tbl (
    xp_progress_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    gained_xp INTEGER,
    gained_xp_date DATETIME,
    FOREIGN KEY (user_ID) REFERENCES user_tbl(user_ID)
);
    
    CREATE TABLE xp_tbl (
    xp_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    chat_session_ID INTEGER,
    entry_ID INTEGER,
    xp_feature TEXT CHECK(xp_feature IN ('palette 1', 'palette 2', 'palette 3', 'emoji set 1', 'emoji set 2', 'emoji set 3', 'moodi accessories')),
    xp_feature_value TEXT CHECK(
        (xp_feature = 'palette 1' AND xp_feature_value = '70') OR
        (xp_feature = 'palette 2' AND xp_feature_value = '140') OR
        (xp_feature = 'palette 3' AND xp_feature_value = '210') OR
        (xp_feature = 'emoji set 1' AND xp_feature_value = '280') OR
        (xp_feature = 'emoji set 2' AND xp_feature_value = '350') OR
        (xp_feature = 'emoji set 3' AND xp_feature_value = '420') OR
        (xp_feature = 'moodi accessories' AND xp_feature_value = '490')
    ),
    current_xp INTEGER,
    FOREIGN KEY (user_ID) REFERENCES user_tbl(user_ID),
    FOREIGN KEY (chat_session_ID) REFERENCES chat_session_tbl(chat_session_ID),
    FOREIGN KEY (entry_ID) REFERENCES mood_entries_tbl(entry_ID)
);

    

