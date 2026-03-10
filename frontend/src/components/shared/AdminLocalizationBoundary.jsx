import React, { useEffect, useMemo, useRef } from "react";
import { useAdminLanguage } from "../../context/AdminLanguageContext";

const tamilTranslations = {
  "Admin": "நிர்வாகம்",
  "Dashboard": "டாஷ்போர்டு",
  "Queue Management": "வரிசை நிர்வாகம்",
  "Event Scheduler": "நிகழ்வு அட்டவணை",
  "Event History": "நிகழ்வு வரலாறு",
  "Counters": "கவுண்டர்கள்",
  "Analytics": "பகுப்பாய்வு",
  "Predictions": "முன்கணிப்புகள்",
  "Settings": "அமைப்புகள்",
  "Back": "பின்",
  "Dashboard Overview": "டாஷ்போர்டு கண்ணோட்டம்",
  "Last 24 hours": "கடைசி 24 மணி நேரம்",
  "Total Queues": "மொத்த வரிசைகள்",
  "Active Counters": "செயலில் உள்ள கவுண்டர்கள்",
  "Pending Events": "நிலுவையில் உள்ள நிகழ்வுகள்",
  "Total Customers": "மொத்த பயனர்கள்",
  "Avg Wait Time": "சராசரி காத்திருப்பு நேரம்",
  "Quick Actions": "விரைவு செயல்கள்",
  "Schedule New Event": "புதிய நிகழ்வை அட்டவணைப்படுத்து",
  "Manage Queues": "வரிசைகளை நிர்வகி",
  "Manage Counters": "கவுண்டர்களை நிர்வகி",
  "View Analytics": "பகுப்பாய்வை காண்க",
  "ML Predictions": "எம்.எல் முன்கணிப்புகள்",
  "ML Predictions Preview": "எம்.எல் முன்கணிப்பு முன்னோட்டம்",
  "Next Peak Time:": "அடுத்த உச்ச நேரம்:",
  "customers predicted": "பயனர்கள் என முன்கணிக்கப்பட்டது",
  "No predictions available yet": "இன்னும் முன்கணிப்புகள் இல்லை",
  "View All Predictions": "அனைத்து முன்கணிப்புகளையும் காண்க",
  "Recent Activity": "சமீபத்திய செயல்பாடு",
  "New event scheduled": "புதிய நிகழ்வு அட்டவணைப்படுத்தப்பட்டது",
  "Queue updated": "வரிசை புதுப்பிக்கப்பட்டது",
  "Counter activated": "கவுண்டர் செயல்படுத்தப்பட்டது",
  "General Health Checkup - 2 hours ago": "பொது சுகாதார பரிசோதனை - 2 மணி நேரத்திற்கு முன்",
  "5 customers joined queue - 3 hours ago": "5 பயனர்கள் வரிசையில் சேர்ந்தனர் - 3 மணி நேரத்திற்கு முன்",
  "Counter 3 is now active - 4 hours ago": "கவுண்டர் 3 இப்போது செயல்பாட்டில் உள்ளது - 4 மணி நேரத்திற்கு முன்",
  "Admin Portal": "நிர்வாக நுழைவாயில்",
  "Restricted access for authorized personnel": "அங்கீகரிக்கப்பட்ட பணியாளர்களுக்கு மட்டும் அனுமதி",
  "Email": "மின்னஞ்சல்",
  "Password": "கடவுச்சொல்",
  "Enter Admin Email": "நிர்வாக மின்னஞ்சலை உள்ளிடவும்",
  "Enter Password": "கடவுச்சொல்லை உள்ளிடவும்",
  "Authenticating...": "சரிபார்க்கப்படுகிறது...",
  "Authenticate": "உள்நுழைக",
  "Return to Public Site": "பொது தளத்திற்கு திரும்பு",
  "Analytics & Reports": "பகுப்பாய்வு மற்றும் அறிக்கைகள்",
  "Comprehensive analytics with ML-powered insights": "எம்.எல் ஆதரித்த ஆழ்ந்த பகுப்பாய்வு",
  "ML Model Performance": "எம்.எல் மாதிரி செயல்திறன்",
  "Real-time predictions with": "நேரடி முன்கணிப்புகள்",
  "accuracy": "துல்லியம்",
  "Predictions appear after model training is complete": "மாதிரி பயிற்சி முடிந்த பின் முன்கணிப்புகள் தோன்றும்",
  "Queue Trends (Today)": "வரிசை போக்குகள் (இன்று)",
  "Queue Count": "வரிசை எண்ணிக்கை",
  "Peak Hours": "உச்ச நேரங்கள்",
  "Service Popularity": "சேவை பிரபலத்தன்மை",
  "ML Predictions Summary": "எம்.எல் முன்கணிப்பு சுருக்கம்",
  "Next 6 hours peak time predictions": "அடுத்த 6 மணி நேர உச்ச நேர முன்கணிப்புகள்",
  "ML-Powered Predictions": "எம்.எல் ஆதரித்த முன்கணிப்புகள்",
  "AI-driven insights powered by machine learning algorithms": "இயந்திரக் கற்றல் அல்கோரிதம்கள் வழங்கும் அறிவுறுத்தல்கள்",
  "Model Accuracy": "மாதிரி துல்லியம்",
  "Predictions Today": "இன்றைய முன்கணிப்புகள்",
  "Avg Accuracy": "சராசரி துல்லியம்",
  "Last Updated": "கடைசியாக புதுப்பிக்கப்பட்டது",
  "Peak Time Predictions (ML)": "உச்ச நேர முன்கணிப்புகள் (எம்.எல்)",
  "Predicted using historical data and ML algorithms": "வரலாற்று தரவு மற்றும் எம்.எல் மூலம் கணிக்கப்பட்டது",
  "Wait Time Predictions (ML)": "காத்திருப்பு நேர முன்கணிப்புகள் (எம்.எல்)",
  "AI-predicted wait times with accuracy metrics": "துல்லியமான காத்திருப்பு நேர எம்.எல் கணிப்புகள்",
  "Predicted:": "கணிக்கப்பட்டது:",
  "Actual:": "உண்மை:",
  "Crowd Level Forecast (ML)": "கூட்டநிலை முன்னறிவிப்பு (எம்.எல்)",
  "7-day forecast using machine learning models": "இயந்திரக் கற்றல் மாதிரிகள் பயன்படுத்திய 7 நாள் முன்னறிவிப்பு",
  "probability": "சாத்தியம்",
  "Machine Learning Model Information": "இயந்திரக் கற்றல் மாதிரி தகவல்",
  "Algorithm:": "அல்கோரிதம்:",
  "Training Data:": "பயிற்சி தரவு:",
  "Features:": "அம்சங்கள்:",
  "Update Frequency:": "புதுப்பிப்பு இடைவெளை:",
  "Random Forest Regression": "ரேண்டம் ஃபாரஸ்ட் ரெக்ரெஷன்",
  "6 months historical data": "6 மாத வரலாற்று தரவு",
  "Time, Day, Historical patterns, Weather": "நேரம், நாள், வரலாற்று முறை, வானிலை",
  "Real-time (every 5 minutes)": "நேரடி (ஒவ்வொரு 5 நிமிடத்திற்கும்)",
  "Queue Management": "வரிசை நிர்வாகம்",
  "Section 1 - Waiting": "பகுதி 1 - காத்திருப்பில்",
  "Tokens waiting to be served": "சேவை பெற காத்திருக்கும் டோக்கன்கள்",
  "No waiting tokens": "காத்திருக்கும் டோக்கன்கள் இல்லை",
  "Start": "தொடங்கு",
  "Cancel": "ரத்து செய்",
  "Section 2 - In Progress": "பகுதி 2 - நடைபெற்று கொண்டிருக்கிறது",
  "Tokens currently being served": "தற்போது சேவை பெறும் டோக்கன்கள்",
  "No tokens in progress": "நடைபெறும் டோக்கன்கள் இல்லை",
  "Complete": "முடி",
  "Section 3 - Cancelled": "பகுதி 3 - ரத்து செய்யப்பட்டது",
  "Tokens cancelled by admin": "நிர்வாகம் ரத்து செய்த டோக்கன்கள்",
  "No cancelled tokens": "ரத்து செய்யப்பட்ட டோக்கன்கள் இல்லை",
  "Revoke": "மீட்டமை",
  "Section 4 - Completed": "பகுதி 4 - முடிக்கப்பட்டது",
  "Tokens completed successfully": "வெற்றிகரமாக முடிக்கப்பட்ட டோக்கன்கள்",
  "No completed tokens": "முடிக்கப்பட்ட டோக்கன்கள் இல்லை",
  "No actions": "செயல்கள் இல்லை",
  "Token Number": "டோக்கன் எண்",
  "Service": "சேவை",
  "Status": "நிலை",
  "Joined At": "சேர்ந்த நேரம்",
  "Actions": "செயல்கள்",
  "WAITING": "காத்திருப்பு",
  "IN PROGRESS": "நடைபெற்று கொண்டிருக்கிறது",
  "CANCELLED": "ரத்து செய்யப்பட்டது",
  "COMPLETED": "முடிந்தது",
  "Counter Management": "கவுண்டர் நிர்வாகம்",
  "Smart Assignment Panel": "செயல்முறை ஒதுக்கீட்டு பலகை",
  "Organization-wise counters generated from Event Scheduler service types": "நிகழ்வு அட்டவணை சேவை வகைகளிலிருந்து உருவான அமைப்பு வாரியான கவுண்டர்கள்",
  "Total:": "மொத்தம்:",
  "Active:": "செயலில்:",
  "Idle:": "இயங்காமல்:",
  "Utilization": "பயன்பாடு",
  "Counters created from this organization's event service types": "இந்த அமைப்பின் நிகழ்வு சேவை வகைகளிலிருந்து உருவான கவுண்டர்கள்",
  "No services configured for this organization.": "இந்த அமைப்பிற்கு எந்த சேவையும் அமைக்கப்படவில்லை.",
  "Service Type:": "சேவை வகை:",
  "waiting": "காத்திருப்பு",
  "total": "மொத்தம்",
  "Current Token:": "தற்போதைய டோக்கன்:",
  "No active token": "செயலில் டோக்கன் இல்லை",
  "Calling...": "அழைக்கப்படுகிறது...",
  "Call Next Token": "அடுத்த டோக்கனை அழை",
  "Event Scheduler": "நிகழ்வு அட்டவணை",
  "Schedule New Event": "புதிய நிகழ்வை அட்டவணைப்படுத்து",
  "Event scheduled successfully! It will appear in Customer Dashboard.": "நிகழ்வு வெற்றிகரமாக அட்டவணைப்படுத்தப்பட்டது! இது பயனர் டாஷ்போர்டில் தோன்றும்.",
  "Organization Type": "அமைப்பு வகை",
  "-- Select Organization Type --": "-- அமைப்பு வகையை தேர்வு செய்க --",
  "Event Title": "நிகழ்வு தலைப்பு",
  "Organization Name": "அமைப்பு பெயர்",
  "Number of Tokens": "டோக்கன்களின் எண்ணிக்கை",
  "Doctor Name": "மருத்துவர் பெயர்",
  "Profession": "தொழில்",
  "HR Name / POC Name": "HR பெயர் / தொடர்பு நபர் பெயர்",
  "Start Date": "தொடக்க தேதி",
  "End Date": "முடிவு தேதி",
  "Start Time": "தொடக்க நேரம்",
  "End Time": "முடிவு நேரம்",
  "Location": "இடம்",
  "Service Types (Manual Entry)": "சேவை வகைகள் (கையால் உள்ளீடு)",
  "Add Service": "சேவையை சேர்",
  "No services added yet. Add at least one service type.": "இன்னும் சேவைகள் சேர்க்கப்படவில்லை. குறைந்தது ஒரு சேவையைச் சேர்க்கவும்.",
  "Save Event": "நிகழ்வை சேமி",
  "Event QR Code": "நிகழ்வு QR குறியீடு",
  "Scheduled Events": "அட்டவணைப்படுத்தப்பட்ட நிகழ்வுகள்",
  "Events": "நிகழ்வுகள்",
  "Organization": "அமைப்பு",
  "Name": "பெயர்",
  "Available": "கிடைக்கும்",
  "Action": "செயல்",
  "Completing...": "முடிக்கப்படுகிறது...",
  "Deleting...": "நீக்கப்படுகிறது...",
  "Delete": "நீக்கு",
  "Enter event title": "நிகழ்வு தலைப்பை உள்ளிடவும்",
  "Enter organization name": "அமைப்பு பெயரை உள்ளிடவும்",
  "Enter total tokens (max 9999)": "மொத்த டோக்கன்களை உள்ளிடவும் (அதிகபட்சம் 9999)",
  "Enter doctor name": "மருத்துவர் பெயரை உள்ளிடவும்",
  "Enter profession": "தொழிலை உள்ளிடவும்",
  "Enter HR or POC name": "HR அல்லது தொடர்பு நபர் பெயரை உள்ளிடவும்",
  "Enter event location": "நிகழ்வு இடத்தை உள்ளிடவும்",
  "Type a service and press Enter or Add": "ஒரு சேவையை টাইப் செய்து Enter அல்லது Add அழுத்தவும்",
  "Event History": "நிகழ்வு வரலாறு",
  "Refresh": "புதுப்பிப்பு",
  "Total Completed": "மொத்தம் முடிந்தவை",
  "All time": "முழு காலம்",
  "Manually Deleted": "கையால் நீக்கப்பட்டது",
  "Admin removals": "நிர்வாக நீக்கங்கள்",
  "Auto-Expired": "தானாக காலாவதியானது",
  "Past end date": "முடிவு தேதியை கடந்தது",
  "Total Users Served": "சேவை பெற்ற மொத்த பயனர்கள்",
  "Completed across all events": "அனைத்து நிகழ்வுகளிலும் முடிந்தவை",
  "Showing stats for": "புள்ளிவிவரங்கள் காட்டப்படுவது",
  "filtered event": "வடிகட்டிய நிகழ்வு",
  "filtered events": "வடிகட்டிய நிகழ்வுகள்",
  "Clear filters": "வடிகட்டலை நீக்கு",
  "Search events by title, organization, or location...": "தலைப்பு, அமைப்பு அல்லது இடம் மூலம் நிகழ்வுகளை தேடவும்...",
  "All Reasons": "அனைத்து காரணங்களும்",
  "Completed": "முடிந்தது",
  "Archived Events": "காப்பக நிகழ்வுகள்",
  "Record": "பதிவு",
  "Records": "பதிவுகள்",
  "Loading event history...": "நிகழ்வு வரலாறு ஏற்றப்படுகிறது...",
  "No matching events found": "பொருந்தும் நிகழ்வுகள் எதுவும் கிடைக்கவில்லை",
  "No event history yet": "இன்னும் நிகழ்வு வரலாறு இல்லை",
  "Try adjusting your search or filter criteria.": "உங்கள் தேடல் அல்லது வடிகட்டலை மாற்றிப் பாருங்கள்.",
  "Deleted and expired events will appear here automatically.": "நீக்கப்பட்ட மற்றும் காலாவதியான நிகழ்வுகள் இங்கே தானாக தோன்றும்.",
  "Event Details": "நிகழ்வு விவரங்கள்",
  "Type": "வகை",
  "Schedule": "அட்டவணை",
  "Time": "நேரம்",
  "Deleted At": "நீக்கப்பட்ட நேரம்",
  "User Statistics": "பயனர் புள்ளிவிவரங்கள்",
  "Joined": "சேர்ந்தது",
  "Serving": "சேவை வழங்கப்படுகிறது",
  "Cancelled": "ரத்து செய்யப்பட்டது",
  "Permanently Delete": "நிரந்தரமாக நீக்கு",
  "Profile": "சுயவிவரம்",
  "Notifications": "அறிவிப்புகள்",
  "Preferences": "விருப்பங்கள்",
  "Security": "பாதுகாப்பு",
  "Profile Information": "சுயவிவர தகவல்",
  "Update your admin profile details and organization information.": "உங்கள் நிர்வாக சுயவிவர விவரங்களையும் அமைப்பு தகவலையும் புதுப்பிக்கவும்.",
  "Full Name": "முழு பெயர்",
  "Email Address": "மின்னஞ்சல் முகவரி",
  "Phone Number": "தொலைபேசி எண்",
  "Save Changes": "மாற்றங்களை சேமி",
  "Saved successfully!": "வெற்றிகரமாக சேமிக்கப்பட்டது!",
  "Notification Preferences": "அறிவிப்பு விருப்பங்கள்",
  "Configure how and when you receive alerts and reports.": "எப்போது மற்றும் எப்படி அறிவிப்புகள் பெற வேண்டும் என்பதை அமைக்கவும்.",
  "Email Alerts": "மின்னஞ்சல் அறிவிப்புகள்",
  "Queue Overflow Alerts": "வரிசை நிரம்பல் அறிவிப்புகள்",
  "Crowd Level Warnings": "கூட்டநிலை எச்சரிக்கைகள்",
  "Daily Summary Report": "தினசரி சுருக்க அறிக்கை",
  "Weekly Analytics Report": "வாராந்திர பகுப்பாய்வு அறிக்கை",
  "System Maintenance Alerts": "அமைப்பு பராமரிப்பு அறிவிப்புகள்",
  "Receive important alerts via email": "முக்கிய அறிவிப்புகளை மின்னஞ்சலில் பெறவும்",
  "Get notified when queues exceed capacity": "வரிசை திறனை மீறும்போது அறிவிப்பு பெறவும்",
  "Alerts when crowd levels reach critical thresholds": "கூட்டநிலை ஆபத்தான அளவை எட்டும்போது எச்சரிக்கை",
  "Receive a daily activity summary each morning": "ஒவ்வொரு காலையிலும் தினசரி செயல்பாட்டு சுருக்கம் பெறவும்",
  "Get weekly performance insights every Monday": "ஒவ்வொரு திங்கட்கிழமையும் வாராந்திர செயல்திறன் தகவல் பெறவும்",
  "Be notified about scheduled maintenance": "அட்டவணைப்படுத்தப்பட்ட பராமரிப்பு பற்றி அறிவிப்பு பெறவும்",
  "Save Preferences": "விருப்பங்களை சேமி",
  "System Preferences": "அமைப்பு விருப்பங்கள்",
  "Customize your dashboard experience and system behavior.": "உங்கள் டாஷ்போர்டு மற்றும் அமைப்பு செயல்பாட்டை தனிப்பயனாக்கவும்.",
  "Appearance": "தோற்றம்",
  "Light Mode": "ஒளி நிலை",
  "Dark Mode": "இருள் நிலை",
  "Language": "மொழி",
  "Timezone": "நேர மண்டலம்",
  "Dashboard Auto-Refresh": "டாஷ்போர்டு தானியங்கி புதுப்பிப்பு",
  "English": "ஆங்கிலம்",
  "Hindi": "ஹிந்தி",
  "Kannada": "கன்னடம்",
  "Tamil": "தமிழ்",
  "Telugu": "தெலுங்கு",
  "Every 15 seconds": "ஒவ்வொரு 15 வினாடிக்கும்",
  "Every 30 seconds": "ஒவ்வொரு 30 வினாடிக்கும்",
  "Every 1 minute": "ஒவ்வொரு 1 நிமிடத்திற்கும்",
  "Every 5 minutes": "ஒவ்வொரு 5 நிமிடத்திற்கும்",
  "Security Settings": "பாதுகாப்பு அமைப்புகள்",
  "Manage your password and account security options.": "உங்கள் கடவுச்சொல் மற்றும் கணக்கு பாதுகாப்பை நிர்வகிக்கவும்.",
  "Change Password": "கடவுச்சொல்லை மாற்று",
  "Current Password": "தற்போதைய கடவுச்சொல்",
  "New Password": "புதிய கடவுச்சொல்",
  "Confirm New Password": "புதிய கடவுச்சொல்லை உறுதிப்படுத்து",
  "Enter current password": "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்",
  "Enter new password": "புதிய கடவுச்சொல்லை உள்ளிடவும்",
  "Confirm new password": "புதிய கடவுச்சொல்லை உறுதிப்படுத்து",
  "Updating...": "புதுப்பிக்கப்படுகிறது...",
  "Update Password": "கடவுச்சொல்லை புதுப்பி",
  "Active Session": "செயலில் உள்ள அமர்வு",
  "Login Time": "உள்நுழைந்த நேரம்",
  "Session Status": "அமர்வு நிலை",
  "Active": "செயலில்",
  "Role": "பங்கு",
  "Administrator": "நிர்வாகி",
  "Danger Zone": "ஆபத்து பகுதி",
  "Logging out will end your current session and redirect to the public site.": "வெளியேறுவது உங்கள் தற்போதைய அமர்வை முடித்து பொது தளத்துக்கு மாற்றும்.",
  "Log Out": "வெளியேறு",
  "Changes saved successfully!": "மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!"
};

const preserveWhitespaceReplace = (originalText, translatedText) => {
  const leading = originalText.match(/^\s*/)?.[0] || "";
  const trailing = originalText.match(/\s*$/)?.[0] || "";
  return `${leading}${translatedText}${trailing}`;
};

const translateLiteral = (literal) => {
  if (!literal) return literal;
  const trimmed = literal.trim();
  const translated = tamilTranslations[trimmed];
  if (!translated) return literal;
  return preserveWhitespaceReplace(literal, translated);
};

const translatableAttributes = ["placeholder", "title", "aria-label"];

const applyTranslations = (root, language, textOriginals) => {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!textOriginals.has(node)) {
      textOriginals.set(node, node.textContent);
    }
    const original = textOriginals.get(node) || "";
    node.textContent = language === "ta" ? translateLiteral(original) : original;
    node = walker.nextNode();
  }

  root.querySelectorAll("*").forEach((element) => {
    translatableAttributes.forEach((attributeName) => {
      const dataKey = `adminOriginal${attributeName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
      const currentValue = element.getAttribute(attributeName);
      if (currentValue === null) return;
      if (!element.dataset[dataKey]) {
        element.dataset[dataKey] = currentValue;
      }
      const original = element.dataset[dataKey];
      element.setAttribute(
        attributeName,
        language === "ta" ? translateLiteral(original) : original
      );
    });
  });
};

const AdminLocalizationBoundary = ({ children }) => {
  const { language } = useAdminLanguage();
  const rootRef = useRef(null);
  const textOriginals = useMemo(() => new WeakMap(), []);
  const observerRef = useRef(null);

  const startObserving = () => {
    if (!rootRef.current || !observerRef.current) return;
    observerRef.current.observe(rootRef.current, {
      childList: true,
      subtree: true,
    });
  };

  const stopObserving = () => {
    if (!observerRef.current) return;
    observerRef.current.disconnect();
  };

  useEffect(() => {
    if (!rootRef.current) return;

    stopObserving();
    applyTranslations(rootRef.current, language, textOriginals);
    startObserving();

    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        stopObserving();
        applyTranslations(rootRef.current, language, textOriginals);
        startObserving();
      });
    }

    startObserving();

    return () => {
      stopObserving();
    };
  }, [language, textOriginals]);

  useEffect(() => {
    if (!rootRef.current) return;

    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        stopObserving();
        if (rootRef.current) {
          applyTranslations(rootRef.current, language, textOriginals);
        }
        startObserving();
      });
    }

    stopObserving();
    applyTranslations(rootRef.current, language, textOriginals);
    startObserving();

    return () => {
      applyTranslations(rootRef.current, language, textOriginals);
      stopObserving();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
};

export default AdminLocalizationBoundary;
