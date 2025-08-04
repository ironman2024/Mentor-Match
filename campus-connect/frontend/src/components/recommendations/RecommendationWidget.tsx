import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Users, Calendar, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  teamSize: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy: {
    name: string;
    avatar?: string;
  };
}

interface RecommendationWidgetProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
  onProjectClick?: (projectId: string) => void;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  maxItems = 3,
  showHeader = true,
  compact = false,
  onProjectClick
}) => {
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/projects/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    } else {
      window.location.href = `/projects/${projectId}`;
    }
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        {showHeader && (
          <CardHeader className={compact ? 'pb-2' : ''}>
            <CardTitle className={compact ? 'text-lg' : ''}>
              <Star className="inline w-5 h-5 mr-2" />
              Recommended for You
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        {showHeader && (
          <CardHeader className={compact ? 'pb-2' : ''}>
            <CardTitle className={compact ? 'text-lg' : ''}>
              <Star className="inline w-5 h-5 mr-2" />
              Recommended for You
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No recommendations available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'p-4' : ''}>
      {showHeader && (
        <CardHeader className={compact ? 'pb-2' : ''}>
          <CardTitle className={compact ? 'text-lg' : ''}>
            <Star className="inline w-5 h-5 mr-2" />
            Recommended for You
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((project) => (
            <div
              key={project._id}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProjectClick(project._id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                  {project.title}
                </h4>
                <Badge className={`text-xs ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </Badge>
              </div>
              
              <p className={`text-gray-600 mb-3 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {project.skills.slice(0, compact ? 2 : 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {project.skills.length > (compact ? 2 : 3) && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.skills.length - (compact ? 2 : 3)}
                  </Badge>
                )}
              </div>
              
              <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.teamSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.duration}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
        
        {!compact && (
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => window.location.href = '/projects'}
          >
            View All Projects
          </Button>
        )}
      </CardContent>
    </Card>
  );
};