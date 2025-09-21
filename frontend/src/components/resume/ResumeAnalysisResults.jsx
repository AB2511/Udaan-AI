import React, { useState, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getResourcesForSkill, generateLearningPathWithResources } from '../../data/learningResources';
import { saveResumeText } from '../../services/resumeService';

const ResumeAnalysisResults = ({ analysisData, onAnalyzeAnother }) => {
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    gaps: true,
    learningPath: true,
    recommendations: false
  });
  const [isUpdatingResume, setIsUpdatingResume] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const showToast = useCallback((message, type) => {
    addToast(message, type);
  }, [addToast]);

  const handleUpdateResume = useCallback(async () => {
    if (!user || !analysisData?.rawText) {
      showToast('No resume text available to update', 'error');
      return;
    }

    try {
      setIsUpdatingResume(true);
      await saveResumeText(analysisData.rawText);
      showToast('Resume saved to your profile', 'success');
    } catch (error) {
      console.error('Failed to update resume:', error);
      showToast('Failed to save resume', 'error');
    } finally {
      setIsUpdatingResume(false);
    }
  }, [user, analysisData?.rawText, showToast]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleResourceClick = useCallback((resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      showToast(`Opening ${resource.title}`, 'info');
    }
  }, [showToast]);

  const getSkillCategoryColor = useCallback((category) => {
    const colors = {
      'technical': 'bg-blue-100 text-blue-800 border-blue-200',
      'soft': 'bg-green-100 text-green-800 border-green-200',
      'domain': 'bg-purple-100 text-purple-800 border-purple-200',
      'tools': 'bg-orange-100 text-orange-800 border-orange-200',
      'languages': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.default;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getResourceTypeIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'course':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v5a2 2 0 002 2h2a2 2 0 002-2v-5" />
          </svg>
        );
      case 'tutorial':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
    }
  }, []);

  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h3>
        <p className="text-gray-600">Upload a resume to see analysis results</p>
      </div>
    );
  }

  const {
    extractedSkills = [],
    skillGaps = [],
    learningPath = [],
    recommendations = '',
    overallScore = 0,
    analysisDate,
    careerPath = []
  } = analysisData;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Resume Analysis Complete</h2>
            <p className="text-blue-100">
              {analysisDate ? `Analyzed on ${new Date(analysisDate).toLocaleDateString()}` : 'Analysis completed'}
            </p>
          </div>
          {overallScore > 0 && (
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{overallScore}%</div>
              <div className="text-blue-100 text-sm">Overall Score</div>
            </div>
          )}
        </div>
      </div>

      {/* Skills Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('skills')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Identified Skills</h3>
              <p className="text-gray-600 text-sm">{extractedSkills.length} skills found in your resume</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.skills && (
          <div className="px-6 pb-6">
            {extractedSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {extractedSkills.map((skill, index) => {
                  const skillData = typeof skill === 'object' ? skill : { name: skill, category: 'default' };
                  return (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium ${getSkillCategoryColor(skillData.category)}`}
                    >
                      {skillData.name}
                      {skillData.level && (
                        <span className="ml-2 text-xs opacity-75">({skillData.level})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No skills were identified in your resume</p>
                <p className="text-sm mt-1">Consider adding more specific technical skills and competencies</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill Gaps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('gaps')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Skill Gaps & Improvements</h3>
              <p className="text-gray-600 text-sm">{skillGaps.length} areas for development identified</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.gaps ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.gaps && (
          <div className="px-6 pb-6">
            {skillGaps.length > 0 ? (
              <div className="space-y-3">
                {skillGaps.map((gap, index) => {
                  const gapData = typeof gap === 'object' ? gap : { skill: gap, priority: 'medium' };
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{gapData.skill}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(gapData.priority)}`}>
                          {gapData.priority || 'Medium'} Priority
                        </span>
                      </div>
                      {gapData.description && (
                        <p className="text-gray-600 text-sm mb-2">{gapData.description}</p>
                      )}
                      {gapData.suggestion && (
                        <p className="text-blue-600 text-sm font-medium">{gapData.suggestion}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No significant skill gaps identified</p>
                <p className="text-sm mt-1">Your resume shows strong alignment with industry requirements</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Learning Path - Grouped by Skill Gaps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('learningPath')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Role-Specific Learning Path</h3>
              <p className="text-gray-600 text-sm">Targeted skills development for your career goal</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.learningPath ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections.learningPath && (
          <div className="px-6 pb-6">
            {(() => {
              // Group learning path by skill gaps for better organization
              const groupedLearningPath = learningPath.length > 0 
                ? learningPath
                : skillGaps.length > 0 
                  ? generateLearningPathWithResources(skillGaps)
                  : [
                      {
                        title: 'System Design Fundamentals',
                        duration: '4-6 weeks',
                        priority: 'high',
                        skillGap: 'System Design',
                        whyImportant: 'Essential for senior developer roles and technical interviews',
                        resources: getResourcesForSkill('System Design')
                      },
                      {
                        title: 'Advanced Algorithms & Data Structures',
                        duration: '3-4 weeks', 
                        priority: 'medium',
                        skillGap: 'Advanced Algorithms',
                        whyImportant: 'Critical for problem-solving and coding interviews',
                        resources: getResourcesForSkill('DSA')
                      }
                    ];

              return (
                <div className="space-y-6">
                  {groupedLearningPath.map((step, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                      {/* Header with skill gap context */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h4>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-green-600 text-sm font-medium">⏱️ {step.duration}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(step.priority)}`}>
                                {step.priority} Priority
                              </span>
                            </div>
                            {/* Why this skill gap matters */}
                            {step.skillGap && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div className="flex items-start">
                                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-blue-900">Addresses skill gap: {step.skillGap}</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                      {step.whyImportant || `This skill is crucial for your target role and will significantly improve your competitiveness in the job market.`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Learning Resources */}
                      <div className="ml-14">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Recommended Learning Resources:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(step.resources || getResourcesForSkill(step.title)).slice(0, 4).map((resource, resourceIndex) => (
                            <a
                              key={resourceIndex}
                              href={resource.url || resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                              onClick={() => showToast(`Opening ${resource.title}`, 'info')}
                            >
                              <div className="text-blue-600 mr-3">
                                {resource.type === 'course' ? '🎓' : 
                                 resource.type === 'video' ? '📹' : 
                                 resource.type === 'article' ? '📄' : '📚'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-900">
                                  {resource.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {resource.type || 'Resource'} • {resource.difficulty || 'All levels'}
                                </p>
                              </div>
                              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Recommendations Summary */}
      {recommendations && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('recommendations')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                <p className="text-gray-600 text-sm">Actionable insights for career advancement</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.recommendations ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedSections.recommendations && (
            <div className="px-6 pb-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 leading-relaxed">{recommendations}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onAnalyzeAnother?.()}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyze Another Resume
        </button>
        
        {user && (
          <button
            onClick={handleUpdateResume}
            disabled={isUpdatingResume}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition duration-300 flex items-center justify-center"
          >
            {isUpdatingResume ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Update Resume
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysisResults;