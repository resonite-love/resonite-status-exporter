import express from "express";

// ResoniteのUserStatus APIエンドポイント
const API_ENDPOINT = "https://api.resonite.com/stats/onlineStats"

let cache = ""

const app = express()
app.listen(3000, () => {console.log("OK 3000")})

// prometheus用エンドポイント
app.get("*", async (req, res) => {
    res.header('Content-Type', 'text/plain;charset=utf-8');
    return res.send(cache)
})

const getStatus = async () => {
    try {
        /**
         * response example
         * {
              "captureTimestamp": "2023-09-28T06:44:45.1156027Z",
              "visibleSessionsByAccessLevel": {
                "Anyone": 26,
                "RegisteredUsers": 9,
                "Private": 8,
                "Contacts": 5,
                "ContactsPlus": 10
              },
              "hiddenSessionsByAccessLevel": {
                "Anyone": 4,
                "Private": 6,
                "Contacts": 2,
                "ContactsPlus": 6,
                "RegisteredUsers": 1
              },
              "activeVisibleSessionsByAccessLevel": {
                "RegisteredUsers": 7,
                "Private": 4,
                "Anyone": 10,
                "Contacts": 2,
                "ContactsPlus": 8
              },
              "activeHiddenSessionsByAccessLevel": {
                "Private": 5,
                "Anyone": 1,
                "Contacts": 2,
                "ContactsPlus": 4
              },
              "registeredUsers": 173,
              "presentUsers": 164,
              "awayUsers": 9,
              "instanceCount": 184,
              "usersInVR": 107,
              "usersInScreen": 62,
              "usersOnDesktop": 169,
              "usersOnMobile": 0,
              "usersInVisiblePublicSessions": 46,
              "usersInVisibleSemiAccessibleSessions": 25,
              "usersInHiddenSessions": 24,
              "usersInPrivateSessions": 46,
              "usersBySessionAccessLevel": {
                "ContactsPlus": 39,
                "Private": 46,
                "Anyone": 21,
                "RegisteredUsers": 28,
                "Contacts": 7
              },
              "usersByClientType": {
                "GraphicalClient": 169,
                "Headless": 4
              }
            }
         */
        const res = await fetch(API_ENDPOINT)
        if(!res.ok) {
            console.log("get err")
            return null
        }
        const json = await res.json()
        return formatData(json || {})
    } catch {
        console.error("err")
    }
}

const formatData = (data) => {
    let date = 0
    try {
        date = new Date(data.captureTimestamp).getTime()
    } catch {}

    return {
        captureTimestamp: date,
        visibleSessionsByAccessLevel: {
            Anyone: data.visibleSessionsByAccessLevel.Anyone || 0,
            RegisteredUsers: data.visibleSessionsByAccessLevel.RegisteredUsers || 0,
            Private: data.visibleSessionsByAccessLevel.Private || 0,
            Contacts: data.visibleSessionsByAccessLevel.Contacts || 0,
            ContactsPlus: data.visibleSessionsByAccessLevel.ContactsPlus || 0,
        },
        hiddenSessionsByAccessLevel: {
            Anyone: data.hiddenSessionsByAccessLevel.Anyone || 0,
            Private: data.hiddenSessionsByAccessLevel.Private || 0,
            Contacts: data.hiddenSessionsByAccessLevel.Contacts || 0,
            ContactsPlus: data.hiddenSessionsByAccessLevel.ContactsPlus || 0,
            RegisteredUsers: data.hiddenSessionsByAccessLevel.RegisteredUsers || 0,
        },
        activeVisibleSessionsByAccessLevel: {
            RegisteredUsers: data.activeVisibleSessionsByAccessLevel.RegisteredUsers || 0,
            Private: data.activeVisibleSessionsByAccessLevel.Private || 0,
            Anyone: data.activeVisibleSessionsByAccessLevel.Anyone || 0,
            Contacts: data.activeVisibleSessionsByAccessLevel.Contacts || 0,
            ContactsPlus: data.activeVisibleSessionsByAccessLevel.ContactsPlus || 0,
        },
        activeHiddenSessionsByAccessLevel: {
            Private: data.activeHiddenSessionsByAccessLevel.Private || 0,
            Anyone: data.activeHiddenSessionsByAccessLevel.Anyone || 0,
            Contacts: data.activeHiddenSessionsByAccessLevel.Contacts || 0,
            ContactsPlus: data.activeHiddenSessionsByAccessLevel.ContactsPlus || 0,
            RegisteredUsers: data.activeHiddenSessionsByAccessLevel.RegisteredUsers || 0,
        },
        registeredUsers: data.registeredUsers || 0,
        presentUsers: data.presentUsers || 0,
        awayUsers: data.awayUsers || 0,
        instanceCount: data.instanceCount || 0,
        vrUsers: data.usersInVR || 0,
        screenUsers: data.usersInScreen || 0,
        desktopUsers: data.usersOnDesktop || 0,
        mobileUsers: data.usersOnMobile || 0,
        visiblePublicSessionUsers: data.usersInVisiblePublicSessions || 0,
        visibleSemiAccessibleSessionUsers: data.usersInVisibleSemiAccessibleSessions || 0,
        hiddenSessionUsers: data.usersInHiddenSessions || 0,
        privateSessionUsers: data.usersInPrivateSessions || 0,
        usersBySessionAccessLevel: {
            ContactsPlus: data.usersBySessionAccessLevel.ContactsPlus || 0,
            Private: data.usersBySessionAccessLevel.Private || 0,
            Anyone: data.usersBySessionAccessLevel.Anyone || 0,
            RegisteredUsers: data.usersBySessionAccessLevel.RegisteredUsers || 0,
            Contacts: data.usersBySessionAccessLevel.Contacts || 0,
        },
        usersByClientType: {
            GraphicalClient: data.usersByClientType.GraphicalClient || 0,
            Headless: data.usersByClientType.Headless || 0,
        },
    }
}

// prometheus用テキスト作成
const makeGaugeText = (data) => {
    return `# HELP resonite_capture_timestamp resonite capture_timestamp value
# TYPE resonite_capture_timestamp gauge
resonite_capture_timestamp ${data.captureTimestamp}
# HELP resonite_visible_sessions_by_access_level resonite visible_sessions_by_access_level value
# TYPE resonite_visible_sessions_by_access_level gauge
resonite_visible_sessions_by_access_level{level="Anyone"} ${data.visibleSessionsByAccessLevel.Anyone}
resonite_visible_sessions_by_access_level{level="RegisteredUsers"} ${data.visibleSessionsByAccessLevel.RegisteredUsers}
resonite_visible_sessions_by_access_level{level="Private"} ${data.visibleSessionsByAccessLevel.Private}
resonite_visible_sessions_by_access_level{level="Contacts"} ${data.visibleSessionsByAccessLevel.Contacts}
resonite_visible_sessions_by_access_level{level="ContactsPlus"} ${data.visibleSessionsByAccessLevel.ContactsPlus}
# HELP resonite_hidden_sessions_by_access_level resonite hidden_sessions_by_access_level value
# TYPE resonite_hidden_sessions_by_access_level gauge
resonite_hidden_sessions_by_access_level{level="Anyone"} ${data.hiddenSessionsByAccessLevel.Anyone}
resonite_hidden_sessions_by_access_level{level="Private"} ${data.hiddenSessionsByAccessLevel.Private}
resonite_hidden_sessions_by_access_level{level="Contacts"} ${data.hiddenSessionsByAccessLevel.Contacts}
resonite_hidden_sessions_by_access_level{level="ContactsPlus"} ${data.hiddenSessionsByAccessLevel.ContactsPlus}
resonite_hidden_sessions_by_access_level{level="RegisteredUsers"} ${data.hiddenSessionsByAccessLevel.RegisteredUsers}
# HELP resonite_active_visible_sessions_by_access_level resonite active_visible_sessions_by_access_level value
# TYPE resonite_active_visible_sessions_by_access_level gauge
resonite_active_visible_sessions_by_access_level{level="RegisteredUsers"} ${data.activeVisibleSessionsByAccessLevel.RegisteredUsers}
resonite_active_visible_sessions_by_access_level{level="Private"} ${data.activeVisibleSessionsByAccessLevel.Private}
resonite_active_visible_sessions_by_access_level{level="Anyone"} ${data.activeVisibleSessionsByAccessLevel.Anyone}
resonite_active_visible_sessions_by_access_level{level="Contacts"} ${data.activeVisibleSessionsByAccessLevel.Contacts}
resonite_active_visible_sessions_by_access_level{level="ContactsPlus"} ${data.activeVisibleSessionsByAccessLevel.ContactsPlus}
# HELP resonite_active_hidden_sessions_by_access_level resonite active_hidden_sessions_by_access_level value
# TYPE resonite_active_hidden_sessions_by_access_level gauge
resonite_active_hidden_sessions_by_access_level{level="Private"} ${data.activeHiddenSessionsByAccessLevel.Private}
resonite_active_hidden_sessions_by_access_level{level="Anyone"} ${data.activeHiddenSessionsByAccessLevel.Anyone}
resonite_active_hidden_sessions_by_access_level{level="Contacts"} ${data.activeHiddenSessionsByAccessLevel.Contacts}
resonite_active_hidden_sessions_by_access_level{level="ContactsPlus"} ${data.activeHiddenSessionsByAccessLevel.ContactsPlus}
resonite_active_hidden_sessions_by_access_level{level="RegisteredUsers"} ${data.activeHiddenSessionsByAccessLevel.RegisteredUsers}
# HELP resonite_registered_users resonite registered_users value
# TYPE resonite_registered_users gauge
resonite_registered_users ${data.registeredUsers}
# HELP resonite_present_users resonite present_users value
# TYPE resonite_present_users gauge
resonite_present_users ${data.presentUsers}
# HELP resonite_away_users resonite away_users value
# TYPE resonite_away_users gauge
resonite_away_users ${data.awayUsers}
# HELP resonite_instance_count resonite instance_count value
# TYPE resonite_instance_count gauge
resonite_instance_count ${data.instanceCount}
# HELP resonite_users resonite users value
# TYPE resonite_users gauge
resonite_users{type="VR"} ${data.vrUsers}
resonite_users{type="Screen"} ${data.screenUsers}
resonite_users{type="Desktop"} ${data.desktopUsers}
resonite_users{type="Mobile"} ${data.mobileUsers}
# HELP resonite_visible_public_session_users resonite visible_public_session_users value
# TYPE resonite_visible_public_session_users gauge
resonite_visible_public_session_users ${data.visiblePublicSessionUsers}
# HELP resonite_visible_semi_accessible_session_users resonite visible_semi_accessible_session_users value
# TYPE resonite_visible_semi_accessible_session_users gauge
resonite_visible_semi_accessible_session_users ${data.visibleSemiAccessibleSessionUsers}
# HELP resonite_hidden_session_users resonite hidden_session_users value
# TYPE resonite_hidden_session_users gauge
resonite_hidden_session_users ${data.hiddenSessionUsers}
# HELP resonite_private_session_users resonite private_session_users value
# TYPE resonite_private_session_users gauge
resonite_private_session_users ${data.privateSessionUsers}
# HELP resonite_users_by_session_access_level resonite users_by_session_access_level value
# TYPE resonite_users_by_session_access_level gauge
resonite_users_by_session_access_level{level="ContactsPlus"} ${data.usersBySessionAccessLevel.ContactsPlus}
resonite_users_by_session_access_level{level="Private"} ${data.usersBySessionAccessLevel.Private}
resonite_users_by_session_access_level{level="Anyone"} ${data.usersBySessionAccessLevel.Anyone}
resonite_users_by_session_access_level{level="RegisteredUsers"} ${data.usersBySessionAccessLevel.RegisteredUsers}
resonite_users_by_session_access_level{level="Contacts"} ${data.usersBySessionAccessLevel.Contacts}
# HELP resonite_users_by_client_type resonite users_by_client_type value
# TYPE resonite_users_by_client_type gauge
resonite_users_by_client_type{type="GraphicalClient"} ${data.usersByClientType.GraphicalClient}
resonite_users_by_client_type{type="Headless"} ${data.usersByClientType.Headless}
`
}

// キャッシュ更新
const updateData = async () => {
    const data = await getStatus()
    if(!data) return
    cache = makeGaugeText(data)
    console.log("update")
}

// 初回取得
await updateData()

// 1分に1回更新
setInterval(async () => await updateData() , 60 * 1000)