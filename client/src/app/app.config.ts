import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  Home, Users, BookOpen, Calendar, Briefcase, MessageSquare,
  Bell, User, Settings, LogOut, ChevronDown, Search, Filter,
  Check, X, AlertCircle, Clock, Menu, Plus, Edit, Eye, Shield, Award,
  TrendingUp, CheckCircle, Github, Globe, Linkedin, MapPin, Trash2, XCircle
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({
      Home, Users, BookOpen, Calendar, Briefcase, MessageSquare,
      Bell, User, Settings, LogOut, ChevronDown, Search, Filter,
      Check, X, AlertCircle, Clock, Menu, Plus, Edit, Eye, Shield, Award,
      TrendingUp, CheckCircle, Github, Globe, Linkedin, MapPin, Trash2, XCircle
    }))
  ]
};
