-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS public.about_content CASCADE;
DROP TABLE IF EXISTS api.about_content CASCADE;

-- Create about_content table in public schema
CREATE TABLE public.about_content (
  id INTEGER PRIMARY KEY,
  about TEXT,
  help TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial content
INSERT INTO public.about_content (id, about, help)
VALUES (
  1,
  'Life-Link.app is the work of a now retired, Advanced Life Support (ALS) paramedic from the State of Victoria in Australia, with 37 years of experience in pre-hospital care.

Throughout his career, John was always trying to make the work of paramedics easier and to achieve better outcomes. However some factors were obviously always going to be out of anyone''s control.

One of these factors was knowing when a patient''s cardiac arrest, or other critical events, actually took place when there were no relatives, bystanders, nearby witnesses.

In these situations, the patient''s condition would never be know until he/she was discovered. By then, especially in time-critical scenarios such as cardiac arrest, very little could be done to resuscitate the patient. 

To compound these problems, relatives and/or other witnesses, may not be aware of any existing medical conditions, or medications that the patient may have been taking. Information that would be vital for paramedics to be aware of in order to more properly treat the patient. Witnesses may also be unable to accurately take vital sign measurements that would be helpful for a paramedic dispatcher.

This why Life-Like.app comes to the fore in saving lives. When a device smart device such as the "Omni-Ring" is correctly fitted, operating and successfully linked to the Life-Link.app it can do the following:

• Continually Monitor and saves a record of the Heart Rate, Blood Oxygen Saturation and the Motion of the user.

• These three measurements and the variation of these readings can used to indicate whether the user is "living" or may be experiencing a life-ending event.
	
• If using these variables, when possible life-ending event is detected, an alert is flashed on the user''s own phone along with the sound of a siren. If the user is alert and able to, he/she can cancel the alarm within 30 seconds and the Live-Link.app will restart to monitor the user or state that there is a problem with the monitoring device.

• If after 30 seconds, the user does not cancel the alert notification, the user''s own phone sends an sms text message to the users (up to three) pre-arranged emergency contacts. If none of these contacts answer within a further 30 seconds, the same sms text message (in a future update) will be sent to the Emergency Service Dispatcher.

• Included in SMS text messages is the following:

• The GPS location of the user''s own phone - Used to find the approximate current location of the user.

• The user provided Full Name, Usual place of residence, Current medications, past and current medical history. Instructions about access if at home i.e. Any entry codes needed.

• A list of the users 3 Emergency Contact Numbers

• Currently available vital signs as detected be the Life-Link.app,

• A readout of the last 30 minutes of recorded Heart Rate, SPO2 and motion of the user.

• Naturally this will also include the users own phone number. This can be used by a dispatcher to eliminate a false-alarm call.

• A list of the user''s 3 Emergency Contact Numbers

• There will also be safeguards in place through the app to reduce the possibility of a false-alarm. Such as a proximity sensor to checks if the "Live" user is wearing the ''Omni-Ring" and that everything is functioning correctly.


Why the "Omni-Ring"?

• The inventor of the Life-Link.app has worked closely with the Pennsylvania State University, which developed the "Omni-Ring".

• The "Omni-Ring" only does one thing, but does it very well. Because of this being a "emergency health only" focused smart-ring, it is cost effective to a point that a user can have two Omni-Rings, a spare for when the first one needs changing. This provides a peace-of-mind assurance, that monitoring will take place 24/7.

Life-Link does not guarantee survival from a life-ending event, but the aim is the improve survivability in as many people as possible. Being available world-wide, we hope that many people from all countries will live to tell the tales of their survival, made possible be Life-Link.app.',
  'John has developed and provided the Life-Link.app completely free of charge with not hidden costs at all, ever!

If you however appreciate the app and John''s effort and devotion to patient care, you and make a donate of any amount no matter how small. 

It can be a one-off donation or an ongoing monthly amount. If you do elect to make an ongoing donation, PLEASE keep the amount well within your means. $1 / month will go a long way if this app takes off.

Regardless, John has vowed to support the app for as ling as he can and will make arrangements for it to be taken over by someone like-minded if he can no longer maintain it.'
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin update access" ON public.about_content;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.about_content;

-- Allow anyone to read the content
CREATE POLICY "Allow public read access" ON public.about_content
  FOR SELECT USING (true);

-- Only allow admins to update the content
CREATE POLICY "Allow admin update access" ON public.about_content
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Only allow admins to insert new content
CREATE POLICY "Allow admin insert access" ON public.about_content
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Grant necessary permissions
GRANT ALL ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role; 