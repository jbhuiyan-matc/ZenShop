import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';

const configurePassport = () => {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Only configure OIDC if all required environment variables are present
  const { AUTHENTIK_ISSUER, AUTHENTIK_CLIENT_ID, AUTHENTIK_CLIENT_SECRET } = process.env;
  
  if (AUTHENTIK_ISSUER && AUTHENTIK_CLIENT_ID && AUTHENTIK_CLIENT_SECRET) {
    // Authentik OIDC Strategy
    passport.use('oidc', new OpenIDConnectStrategy({
      issuer: AUTHENTIK_ISSUER,
      authorizationURL: `${AUTHENTIK_ISSUER}/authorize`,
      tokenURL: `${AUTHENTIK_ISSUER}/token`,
      userInfoURL: `${AUTHENTIK_ISSUER}/userinfo`,
      clientID: AUTHENTIK_CLIENT_ID,
      clientSecret: AUTHENTIK_CLIENT_SECRET,
      callbackURL: process.env.AUTHENTIK_CALLBACK_URL || 'https://matcsecdesignc.com/auth/callback',
      scope: ['openid', 'profile', 'email']
    }, (issuer, profile, done) => {
      // Map OIDC profile to user object
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || null,
        username: profile.username || profile.displayName,
        provider: 'authentik'
      };
      return done(null, user);
    }));
    console.log('✓ Authentik OIDC strategy configured');
  } else {
    console.warn('⚠ Authentik SSO not configured - missing environment variables:');
    if (!AUTHENTIK_ISSUER) console.warn('  - AUTHENTIK_ISSUER');
    if (!AUTHENTIK_CLIENT_ID) console.warn('  - AUTHENTIK_CLIENT_ID');
    if (!AUTHENTIK_CLIENT_SECRET) console.warn('  - AUTHENTIK_CLIENT_SECRET');
  }

  return passport;
};

export default configurePassport;
