(ns nevergreen.api.projects
  (:require [clj-cctray.core :as parser]
            [clj-cctray.filtering :as filtering]
            [clojure.string :refer [blank?]]
            [nevergreen.http :refer [http-get]]
            [nevergreen.servers :as servers]
            [nevergreen.security :as security]
            [nevergreen.crypto :as crypt]))

(defn interesting
  "Filters projects to only include sick, healthy building, sick building or projects with an unknown prognosis"
  [projects]
  (filtering/by-prognosis [:sick :sick-building :unknown] projects))

(defn invalid-url? [url]
  (or (blank? url)
      (not (re-find #"https?://" url))))

(defn- ensure-url-is-valid [{:keys [url]}]
  (if (invalid-url? url)
    (throw (IllegalArgumentException. (str url " is not a valid url! Only http(s) urls are supported.")))))

(defn- set-auth-header [username password]
  (if-not (or (blank? username) (blank? password))
    (security/basic-auth-header username password)))

(defn get-server-type [{:keys [serverType url]}]
  (let [server-type (keyword serverType)]
    (if (servers/unknown-server? server-type)
      (servers/detect-server url)
      server-type)))

(defn- add-tray-id [tray-id projects]
  (map #(merge {:tray-id tray-id} %) projects))

(defn fetch-interesting [tray]
  (ensure-url-is-valid tray)
  (let [decrypted-password (if-not (blank? (:password tray)) (crypt/decrypt (:password tray)))]
    (->> (parser/get-projects
           (http-get (:url tray) (set-auth-header (:username tray) decrypted-password))
           {:normalise true :server (get-server-type tray)})
         (interesting)
         (filtering/by-name (:included tray))
         (add-tray-id (:trayId tray)))))

(defn get-interesting [trays]
  (if (= (count trays) 1)
    (fetch-interesting (first trays))
    (flatten (pmap fetch-interesting trays))))

(defn get-all [tray]
  (ensure-url-is-valid tray)
  (let [server-type (get-server-type tray)
        decrypted-password (if-not (blank? (:password tray)) (crypt/decrypt (:password tray)))]
    (parser/get-projects (http-get (:url tray) (set-auth-header (:username tray) decrypted-password))
                         {:normalise true :server server-type})))
