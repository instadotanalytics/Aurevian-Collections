// src/Pages/Profile/tabs/ReferralTab.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiGift, 
  FiCopy, 
  FiShare2, 
  FiCheck, 
  FiUsers, 
  FiDollarSign, 
  FiClock, 
  FiTrendingUp,
  FiMail,
  FiSend,
  FiLoader,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './ReferralTab.module.css';

const ReferralTab = () => {
  const { profile } = useSelector((state) => state.profile);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    rewardsEarned: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // Fetch referral code
      const codeResponse = await axios.get('/api/referrals/my-code', {
        withCredentials: true
      });
      
      if (codeResponse.data.success) {
        setReferralCode(codeResponse.data.data.code);
      }

      // Fetch referral stats
      const statsResponse = await axios.get('/api/referrals/my-stats', {
        withCredentials: true
      });
      
      if (statsResponse.data.success) {
        setReferralStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // If no referral code exists, generate one
      if (error.response?.status === 404) {
        await generateReferralCode();
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const response = await axios.post('/api/referrals/generate', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setReferralCode(response.data.data.code);
        toast.success('🎉 Referral code generated!');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('📋 Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareData = {
      title: 'Join Aurevian Collections',
      text: `🎉 Use my referral code ${referralCode} and get exciting discounts on your first order!`,
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('✅ Shared successfully!');
      } else {
        copyReferralLink();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    }
  };

  const shareViaWhatsApp = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const message = `🎉 Join Aurevian Collections! Use my referral code ${referralCode} to get exciting discounts on your first order! 🛍️\n\n${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const subject = 'Join Aurevian Collections - Get Discounts!';
    const body = `Hi,\n\nI'm using Aurevian Collections and I think you'll love it too!\n\nUse my referral code ${referralCode} to get exciting discounts on your first order.\n\nCheck it out here: ${referralLink}\n\nSee you there! 🎉`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading referral data...</p>
      </div>
    );
  }

  return (
    <div className={styles.referralTab}>
      {/* Hero Section */}
      <div className={styles.referralHero}>
        <FiGift className={styles.heroIcon} />
        <h2>Refer & Earn Rewards! 🎉</h2>
        <p>
          Share your unique referral code with friends and family.
          When they make their first purchase, you both get rewarded!
        </p>
      </div>

      <div className={styles.referralMainCard}>
        {/* Referral Code Section */}
        <div className={styles.referralCodeSection}>
          <h3>Your Referral Code</h3>
          
          {!referralCode ? (
            <div className={styles.noCodeContainer}>
              <FiInfo className={styles.noCodeIcon} />
              <p>You don't have a referral code yet</p>
              <button 
                className={styles.generateBtn}
                onClick={generateReferralCode}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <FiLoader className={styles.spinner} /> Generating...
                  </>
                ) : (
                  'Generate Code'
                )}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.referralCodeDisplay}>
                <span className={styles.code}>{referralCode}</span>
              </div>

              <div className={styles.referralLinkBox}>
                <input 
                  type="text" 
                  value={`${window.location.origin}/signup?ref=${referralCode}`}
                  readOnly
                  className={styles.referralLinkInput}
                />
                <button 
                  className={styles.copyLinkBtn}
                  onClick={copyReferralLink}
                  title="Copy link"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </div>

              <div className={styles.shareButtons}>
                <button 
                  className={styles.shareWhatsApp} 
                  onClick={shareViaWhatsApp}
                >
                  <FiSend /> Share on WhatsApp
                </button>
                <button 
                  className={styles.shareEmail} 
                  onClick={shareViaEmail}
                >
                  <FiMail /> Share via Email
                </button>
                <button 
                  className={styles.shareLink}
                  onClick={shareReferralLink}
                >
                  <FiShare2 /> Share Link
                </button>
              </div>
            </>
          )}
        </div>

        {/* Referral Stats Section */}
        <div className={styles.referralStatsSection}>
          <h3>Your Referral Stats</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <FiUsers className={styles.statIcon} />
              <span className={styles.statNumber}>{referralStats.totalReferrals || 0}</span>
              <span className={styles.statLabel}>Total Referrals</span>
            </div>
            <div className={styles.statBox}>
              <FiDollarSign className={styles.statIcon} />
              <span className={styles.statNumber}>₹{referralStats.rewardsEarned || 0}</span>
              <span className={styles.statLabel}>Earned Rewards</span>
            </div>
            <div className={styles.statBox}>
              <FiClock className={styles.statIcon} />
              <span className={styles.statNumber}>₹{referralStats.pendingRewards || 0}</span>
              <span className={styles.statLabel}>Pending Rewards</span>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className={styles.howItWorks}>
          <h3>How It Works</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Share Your Code</h4>
                <p>Share your unique referral code with friends</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Friend Signs Up</h4>
                <p>Your friend signs up using your referral code</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Friend Makes Purchase</h4>
                <p>Your friend completes their first order</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Earn Rewards</h4>
                <p>You earn rewards after the order is delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={styles.benefitsSection}>
          <h3>Referral Benefits</h3>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <FiTrendingUp className={styles.benefitIcon} />
              <div>
                <h4>Earn Rewards</h4>
                <p>Earn ₹{profile?.referralReward || 50} for every successful referral</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <FiGift className={styles.benefitIcon} />
              <div>
                <h4>Friend Gets Discount</h4>
                <p>Your friend gets a discount on their first order</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <FiDollarSign className={styles.benefitIcon} />
              <div>
                <h4>Withdraw Anytime</h4>
                <p>Withdraw your earnings to your wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralTab;